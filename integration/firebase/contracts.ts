/** Integration contracts. These are NOT an active Firebase connection. */
export type Role = 'client' | 'admin';
export interface Account { uid:string; name:string; email:string; phone:string; role:Role; }
export interface AuthProvider {
  getCurrentUser(): Account | null;
  signUp(input:{name:string;email:string;password:string}):Promise<Account>;
  signIn(input:{email:string;password:string}):Promise<Account>;
  signOut():Promise<void>;
  requestPasswordReset(email:string):Promise<{sent:boolean}>;
  confirmPasswordReset(input:{code:string;password:string}):Promise<{changed:boolean}>;
  updateProfile(input:{name:string;phone:string}):Promise<Account>;
}
export interface CreateOrderInput {
  // Guest checkout: auth is optional. Server derives identity from a verified token, never from this input.
  items:Array<{productId:string;size:string;quantity:number}>;
  customer:{name:string;phone:string;city:string;address:string;email?:string};
  idempotencyKey:string;
}
export interface OrderRecord {
  id:string;
  customerId:string|null; // null for guests; server-assigned for authenticated clients
  customerType:'guest'|'account';
  status:'new'|'preparing'|'shipped'|'completed'|'cancelled';
  total:number; // computed and snapshotted by server
  currency:'SAR';
  emailStatus:'not-requested'|'pending'|'sent'|'failed';
}
export interface OrderProvider {
  create(input:CreateOrderInput):Promise<{order:OrderRecord;guestReceiptToken?:string}>;
  listMine(cursor?:string):Promise<{items:OrderRecord[];nextCursor?:string}>;
  // Guest lookup must use an unguessable secret receipt token, not just email/order number.
  getGuestReceipt(orderId:string,token:string):Promise<OrderRecord>;
}
export interface ProductRecord {
  id:string;name:string;description:string;price:number;stock:number;
  sizes:string[];collectionId:string|null;imageKeys:string[];
}
export interface CollectionRecord {id:string;name:string;description:string;imageKey:string;}
