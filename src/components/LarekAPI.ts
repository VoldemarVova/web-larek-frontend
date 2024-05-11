import { Api, ApiListResponse } from './base/Api';
import { IOrder, ICard, IOrderResult } from "../types";

export interface ILarekAPI {
    getProductList: () => Promise<ICard[]>
    getProductItem: (id: string) => Promise<ICard>
    postOrder: (order: IOrder) => Promise<IOrderResult>
}

export class LarekAPI extends Api implements ILarekAPI {
    readonly cdn: string

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options)
        this.cdn = cdn
    }

    getProductItem(id: string): Promise<ICard> {
        return this.get(`/product/${id}`).then(
            (item: ICard) => ({
                ...item,
                image: this.cdn + item.image,
            })
        );
    }

    // getLotUpdate(id: string): Promise<LotUpdate> {
    //     return this.get(`/lot/${id}/_auction`).then(
    //         (data: LotUpdate) => data
    //     );
    // }

    getProductList(): Promise<ICard[]> {
        return this.get('/product').then((data: ApiListResponse<ICard>) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }))
        );
    }

    // placeBid(id: string, bid: IBid): Promise<LotUpdate> {
    //     return this.post(`/lot/${id}/_bid`, bid).then(
    //         (data: ILot) => data
    //     );
    // }

    postOrder(order: IOrder): Promise<IOrderResult> {
        return this.post('/order', order).then(
            (data: IOrderResult) => data
        );
    }

}
