// Server-only checkout catalog. Never import payment URLs into browser components.
export const orderProducts=Object.freeze({
 'market-research-full':{id:'market-research-full',currency:'ILS',regularAmount:99,discountedAmount:69,testAmount:5,paymentUrls:{regular:'https://pay.sumit.co.il/15ajtmv/15em4nx/15em4qr/payment/',discounted:'https://pay.sumit.co.il/15ajtmv/15cgqv4/15em78t/payment/',test:'https://pay.sumit.co.il/15ajtmv/15er2an/15er2ao/payment/'}},
 'logo-full':{id:'logo-full',currency:'ILS',regularAmount:99,discountedAmount:69,paymentUrls:{regular:'https://pay.sumit.co.il/15ajtmv/15iyy4k/15iyy4l/payment/',discounted:'https://pay.sumit.co.il/15ajtmv/15iyz6e/15iyz6f/payment/'}},
 'advertising-video':{id:'advertising-video',currency:'ILS',regularAmount:499,discountedAmount:349,perMinute:true,paymentUrls:{regular:'https://pay.sumit.co.il/15ajtmv/15izcsp/15izcsr/payment/',discounted:'https://pay.sumit.co.il/15ajtmv/15izfy9/15izfya/payment/'}},
 'asset-research-full':{id:'asset-research-full',currency:'ILS',regularAmount:99,discountedAmount:69,paymentUrls:{regular:'https://pay.sumit.co.il/15ajtmv/15izhmr/15izhms/payment/',discounted:'https://pay.sumit.co.il/15ajtmv/15izi23/15izi24/payment/'}}
});
export const marketResearchProduct=orderProducts['market-research-full'];
export function getOrderProduct(id){return Object.hasOwn(orderProducts,id)?orderProducts[id]:null;}
export function orderQuantity(product,value=1){if(!Number.isSafeInteger(value)||value<1||value>(product.perMinute?60:1))throw new Error('invalid_fields');return value;}

export function orderPresentation(order){
 const id=order.product_id??'market-research-full',product=getOrderProduct(id);if(!product)throw new Error('invalid_order');
 const quantity=orderQuantity(product,order.quantity??1),amount=order.amount_agorot;
 const valid=order.is_test?id==='market-research-full'&&quantity===1&&amount===500:[product.regularAmount,product.discountedAmount].some(rate=>amount===rate*quantity*100);
 if(!valid)throw new Error('invalid_order');
 const names={'market-research-full':['סקר שוק מלא','Full market research'],'asset-research-full':['תחקיר מניה / מטבע קריפטו מלא','Full stock / crypto research'],'logo-full':['פיתוח לוגו מלא','Full logo development'],'advertising-video':['פיתוח סרטון פרסומת','Advertising video production']};
 return {he:names[id][0],en:names[id][1],quantity,research:id==='market-research-full'||id==='asset-research-full',details:order.request_details??{}};
}
