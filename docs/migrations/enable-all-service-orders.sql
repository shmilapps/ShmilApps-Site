-- ShmilApps project ufolbezpnhyrsyuxuaox only.
-- Adds product metadata and pricing constraints; does not change existing orders/payments/emails.
begin;
alter table public.orders add column if not exists quantity integer not null default 1;
alter table public.orders add column if not exists request_details jsonb not null default '{}'::jsonb;
alter table public.orders drop constraint if exists orders_product_id_check;
alter table public.orders drop constraint if exists orders_regular_price_agorot_check;
alter table public.orders drop constraint if exists orders_final_price_agorot_check;
alter table public.orders drop constraint if exists order_discount_consistency;
alter table public.orders add constraint orders_product_id_check check(product_id in ('market-research-full','logo-full','advertising-video','asset-research-full'));
alter table public.orders add constraint orders_regular_price_agorot_check check(
 (product_id='advertising-video' and quantity between 1 and 60 and regular_price_agorot=49900*quantity)
 or (product_id<>'advertising-video' and quantity=1 and regular_price_agorot=9900));
alter table public.orders add constraint orders_final_price_agorot_check check(final_price_agorot>0 and final_price_agorot<=2994000);
alter table public.orders add constraint order_discount_consistency check(
 (is_test and product_id='market-research-full' and quantity=1 and final_price_agorot=500 and discount_decision='approved')
 or (not is_test and (
  (product_id='advertising-video' and ((discount_decision='none' and final_price_agorot=49900*quantity) or (discount_decision='approved' and final_price_agorot=34900*quantity)))
  or (product_id<>'advertising-video' and ((discount_decision='none' and final_price_agorot=9900) or (discount_decision='approved' and final_price_agorot=6900))))));
do $$ begin
 if not exists(select 1 from pg_constraint where conrelid='public.orders'::regclass and conname='orders_request_details_check') then
  alter table public.orders add constraint orders_request_details_check check(jsonb_typeof(request_details)='object' and octet_length(request_details::text)<=16384);
 end if;
end $$;
-- Patch only the three existing functions. Unexpected definitions roll back this transaction.
do $$
declare v text; w text;
begin
 v:=pg_get_functiondef('public.commit_research_intake(uuid,text,jsonb,jsonb)'::regprocedure);
 if position('request_details' in v)=0 then
  w:=replace(v,'''market-research-full''','coalesce(p_payload->>''product_id'',''market-research-full'')');
  if w=v then raise exception 'Unexpected commit product definition'; end if;v:=w;
  w:=regexp_replace(v,'(''ILS''[[:space:]]*,)[[:space:]]*9900[[:space:]]*,',E'\\1coalesce((p_payload->>''regular_price_agorot'')::integer,9900),');
  if w=v then raise exception 'Unexpected commit price definition'; end if;v:=w;
  w:=regexp_replace(v,'terms_accepted_at[[:space:]]*,[[:space:]]*is_test[[:space:]]*\)', 'terms_accepted_at,is_test,quantity,request_details)');
  if w=v then raise exception 'Unexpected commit column definition'; end if;v:=w;
  w:=regexp_replace(v,'now\(\)[[:space:]]*,[[:space:]]*v_is_test[[:space:]]*\)', 'now(),v_is_test,coalesce((p_payload->>''quantity'')::integer,1),coalesce(p_payload->''request_details'',''{}''::jsonb))');
  if w=v then raise exception 'Unexpected commit values definition'; end if;execute w;
 end if;
 v:=pg_get_functiondef('public.revise_research_intake(uuid,uuid,text,jsonb,jsonb)'::regprocedure);
 if position('v_order.quantity' in v)=0 then
  w:=replace(v,'v_order.product_id<>''market-research-full''','v_order.product_id not in (''market-research-full'',''logo-full'',''advertising-video'',''asset-research-full'')');
  if w=v then raise exception 'Unexpected revision product definition'; end if;v:=w;
  w:=replace(v,'if v_order.status',
   'if coalesce(p_payload->>''product_id'',''market-research-full'') is distinct from v_order.product_id or coalesce((p_payload->>''quantity'')::integer,1) is distinct from v_order.quantity or coalesce((p_payload->>''regular_price_agorot'')::integer,9900) is distinct from v_order.regular_price_agorot then raise exception ''checkout_price_locked''; end if; if v_order.status');
  if w=v then raise exception 'Unexpected revision guard definition'; end if;v:=w;
  w:=replace(v,'update public.orders set description=', 'update public.orders set request_details=coalesce(p_payload->''request_details'',''{}''::jsonb),description=');
  if w=v then raise exception 'Unexpected revision update definition'; end if;execute w;
 end if;
 v:=pg_get_functiondef('public.claim_research_notification(uuid,text)'::regprocedure);
 if position('''product_id''' in v)=0 then
  w:=replace(v,'''order_id'',o.id,','''order_id'',o.id,''product_id'',o.product_id,''quantity'',o.quantity,''request_details'',o.request_details,');
  if w=v then raise exception 'Unexpected mail context definition'; end if;execute w;
 end if;
end $$;
-- Preserve private execution and existing payment confirmation signature.
revoke all on function public.commit_research_intake(uuid,text,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.revise_research_intake(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.claim_research_notification(uuid,text) from public,anon,authenticated;
grant execute on function public.commit_research_intake(uuid,text,jsonb,jsonb) to service_role;
grant execute on function public.revise_research_intake(uuid,uuid,text,jsonb,jsonb) to service_role;
grant execute on function public.claim_research_notification(uuid,text) to service_role;
commit;
-- Price assertions use synthetic rows and are all rolled back; no Storage/provider/mail call.
begin;
do $$
declare c uuid:=gen_random_uuid();o uuid; p text;q integer;r integer;f integer;d text;n integer:=0;
begin
 insert into public.customers(id,full_name,email,phone) values(c,'Synthetic schema check','schema-check@example.invalid','0500000000');
 for p,q,r,f,d in values
 ('market-research-full',1,9900,9900,'none'),('market-research-full',1,9900,6900,'approved'),
 ('logo-full',1,9900,9900,'none'),('logo-full',1,9900,6900,'approved'),
 ('asset-research-full',1,9900,9900,'none'),('asset-research-full',1,9900,6900,'approved'),
 ('advertising-video',1,49900,49900,'none'),('advertising-video',2,99800,69800,'approved')
 loop
  o:=gen_random_uuid();insert into public.orders(id,customer_id,product_id,description,market,report_language,regular_price_agorot,final_price_agorot,discount_decision,terms_accepted,terms_version,terms_accepted_at,quantity)
  values(o,c,p,'Synthetic rollback only','both','he',r,f,d,true,'synthetic',now(),q);n:=n+1;
 end loop;
 begin
  insert into public.orders(customer_id,product_id,description,market,report_language,regular_price_agorot,final_price_agorot,discount_decision,terms_accepted,terms_version,terms_accepted_at,quantity)
  values(c,'advertising-video','Invalid price','both','he',99800,49900,'none',true,'synthetic',now(),2);
  raise exception 'Incorrect video total accepted';
 exception when check_violation then n:=n+1;end;
 begin
  insert into public.orders(customer_id,product_id,description,market,report_language,regular_price_agorot,final_price_agorot,discount_decision,terms_accepted,terms_version,terms_accepted_at,quantity)
  values(c,'logo-full','Invalid quantity','both','he',9900,9900,'none',true,'synthetic',now(),2);
  raise exception 'Invalid logo quantity accepted';
 exception when check_violation then n:=n+1;end;
 if n<>10 then raise exception 'Incomplete synthetic checks';end if;
 raise notice '10/10 synthetic price checks passed; transaction will roll back';
end $$;
rollback;
select proname as function_name,not prosecdef as security_invoker,
has_function_privilege('service_role',oid,'execute') as service_role_allowed,
has_function_privilege('anon',oid,'execute') as anon_allowed,
has_function_privilege('authenticated',oid,'execute') as authenticated_allowed
from pg_proc where oid in (
'public.commit_research_intake(uuid,text,jsonb,jsonb)'::regprocedure,
'public.revise_research_intake(uuid,uuid,text,jsonb,jsonb)'::regprocedure,
'public.claim_research_notification(uuid,text)'::regprocedure,
'public.confirm_order_payment(uuid,text,text,text,integer,text)'::regprocedure);
