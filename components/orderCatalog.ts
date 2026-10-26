export const orderCatalog = {
 'market-research-full': {he:'סקר שוק מלא',en:'Full market research',image:'/portfolio/market-research/market-research-final.png',regular:99,discounted:69,research:true},
 'asset-research-full': {he:'תחקיר מניה / מטבע קריפטו מלא',en:'Full stock / crypto research',image:'/portfolio/orders/asset-research.png',regular:99,discounted:69,research:true},
 'logo-full': {he:'פיתוח לוגו מלא',en:'Full logo development',image:'/portfolio/orders/logo.png',regular:99,discounted:69,research:false},
 'advertising-video': {he:'פיתוח סרטון פרסומת',en:'Advertising video production',image:'/portfolio/orders/advertising-video.png',regular:499,discounted:349,research:false}
} as const;
export type OrderProductId = keyof typeof orderCatalog;
