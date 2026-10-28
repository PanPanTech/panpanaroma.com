export const inquiryEndpoint='https://inquiry.panpantechnology.com/api/inquiries';
export const leadBrand='PanPan Aroma';
export const utmKeys=['utm_source','utm_medium','utm_campaign','utm_term','utm_content'] as const;
export type InquiryContext={kind:string;reference:string;source:string;pageUrl:string;pageTitle:string;siteDomain:string;language:string;attribution?:Record<string,string>};
export function buildSharedInquiry(data:Record<string,FormDataEntryValue|string>,context:InquiryContext){
 const value=(key:string,max=3000)=>String(data[key]??'').trim().slice(0,max);
 const message=[`Website reference: ${context.reference}`,`Request type: ${context.kind}`,`Source page: ${context.source}`,`Packaging: ${value('packaging',250)||'Not specified'}`,`Customization: ${value('customization',250)||'Not specified'}`,`Target timeline: ${value('timeline',250)||'Not specified'}`,'Privacy consent: accepted',value('message')].filter(Boolean).join('\n');
 return {name:value('name',250),company:value('company',250),email:value('email',254),country:value('country',250),product_interest:value('product',250),quantity:value('quantity',250),message,lead_brand:leadBrand,market:'global',site_domain:context.siteDomain,page_url:context.pageUrl,page_title:context.pageTitle,language:context.language,...Object.fromEntries(utmKeys.map(key=>[key,String(context.attribution?.[key]||'').slice(0,500)]))};
}
export function inquiryAccepted(httpOk:boolean,result:{ok?:boolean;sync_status?:string}){return httpOk&&result.ok===true;}
