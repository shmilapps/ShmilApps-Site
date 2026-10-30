/** Routes traced in the full area between the strips, based on the user's sketch. */
type Point={x:number;y:number};
const points=(values:number[][]):Point[]=>values.map(([x,y])=>({x,y}));
export const galaxyRoutes=[
 points([[.50,.44],[.54,.41],[.555,.35],[.51,.30],[.43,.285],[.36,.32],[.315,.40],[.285,.51],[.285,.61],[.34,.68],[.45,.715],[.58,.715],[.655,.66],[.68,.55],[.675,.40],[.64,.29],[.595,.21]]),
 points([[.475,.47],[.445,.53],[.43,.59],[.46,.625],[.55,.635],[.62,.59],[.635,.50],[.615,.37],[.565,.265],[.47,.22],[.365,.235],[.28,.32],[.225,.46],[.225,.62],[.30,.755],[.46,.825],[.65,.81],[.755,.71],[.79,.56],[.78,.39],[.73,.23],[.645,.09]]),
 points([[.45,.445],[.44,.39],[.41,.355],[.37,.365],[.345,.43],[.35,.53],[.41,.61],[.52,.635],[.66,.61],[.755,.54],[.79,.43],[.77,.30],[.70,.22],[.59,.205],[.45,.23],[.31,.31],[.205,.45],[.19,.62],[.27,.76],[.44,.83],[.63,.835],[.77,.755],[.87,.61],[.90,.43]]),
 points([[.48,.455],[.465,.405],[.425,.375],[.38,.40],[.355,.49],[.365,.60],[.43,.70],[.55,.735],[.69,.69],[.76,.59],[.76,.43],[.70,.29],[.59,.22],[.44,.225],[.30,.30],[.215,.405],[.19,.55],[.225,.71],[.32,.855],[.47,.95],[.66,.975],[.79,.90],[.90,.78],[.985,.66]])
];
function spline(route:Point[],t:number):Point{
 const at=Math.min(route.length-1,Math.max(0,t)*(route.length-1));
 const i=Math.min(route.length-2,Math.floor(at)),u=at-i;
 const a=route[Math.max(0,i-1)],b=route[i],c=route[i+1],d=route[Math.min(route.length-1,i+2)];
 const value=(key:'x'|'y')=>.5*((2*b[key])+(-a[key]+c[key])*u+(2*a[key]-5*b[key]+4*c[key]-d[key])*u*u+(-a[key]+3*b[key]-3*c[key]+d[key])*u*u*u);
 return {x:value('x'),y:value('y')};
}
const tables=galaxyRoutes.map(route=>{
 const samples=Array.from({length:501},(_,i)=>spline(route,i/500));
 const distances=[0];
 for(let i=1;i<samples.length;i++)distances.push(distances[i-1]+Math.hypot(samples[i].x-samples[i-1].x,samples[i].y-samples[i-1].y));
 return {samples,distances,length:distances[distances.length-1]};
});
export function routePoint(arm:number,progress:number):Point{
 const {samples,distances,length}=tables[arm];
 const target=Math.min(1,Math.max(0,progress))*length;
 let lo=0,hi=distances.length-1;
 while(lo+1<hi){const mid=(lo+hi)>>1;if(distances[mid]<target)lo=mid;else hi=mid;}
 const t=(target-distances[lo])/(distances[hi]-distances[lo]||1);
 return {x:samples[lo].x+(samples[hi].x-samples[lo].x)*t,y:samples[lo].y+(samples[hi].y-samples[lo].y)*t};
}
const smooth=(start:number,end:number,value:number)=>{const t=Math.max(0,Math.min(1,(value-start)/(end-start)));return t*t*(3-2*t);};
export function routeAppearance(progress:number){
 return {scale:.14+smooth(0,.72,progress)*.96,opacity:smooth(0,.07,progress)*(1-smooth(.73,1,progress))};
}
export const orbitCount=16;
export const orbitPeriod=42/1.15;
export const armLaunchDelays=[0,7/96,7/96,22/96].map(phase=>1.2+phase*orbitPeriod);
export function galaxyFrame(index:number,seconds:number){
 const arm=Math.floor(index/4),slot=index%4;
 const launchAt=armLaunchDelays[arm]+slot*orbitPeriod/4;
 const active=seconds>=launchAt;
 const phase=active?((seconds-launchAt)%orbitPeriod)/orbitPeriod:0;
 const progress=Math.log1p(3*phase)/Math.log(4);
 return {...routePoint(arm,progress),...routeAppearance(progress),arm,progress,active,launchAt};
}
