export interface WebHooks {
  mode: string;
  webhooks: WebHook[];
}

export interface WebHook {
  id: number;
  name: string;
  url: string;
}

export interface WebhookLog {
  id:number,
  webhook_id:number,
  payload:{
    settlementAmount:number,
    amountPaid:number,
    customer:{
      mode:string,
      first_name:string,
      last_name:string,
      phone:string,
      email:string
    }
  },
  http_code:string | number,
  created_at: string;
  updated_at: string;
}