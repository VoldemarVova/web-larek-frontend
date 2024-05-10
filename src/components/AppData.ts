import {Model} from "./base/Model";
import {ICard, IAppState, FormErrors, IOrder, IOrderForm} from "../types";

export type CatalogChangeEvent = {
    catalog: CardItem[]
};

export class CardItem extends Model<ICard> {
    id?: string;
    description?: string;
    image?: string;
    title?: string;
    price?: number;
    category?: string;
    index?: number;
    button?: string;
    total?: number;
}

export class AppData extends Model<IAppState> {
    basket: CardItem[] = [];
    catalog: CardItem[];
    loading: boolean;
    order: IOrder = {
        items: [],
        email: '',
        phone: '',
        payment: '',
        address: '',
        total: 0
    };
    preview: string | null;
    formErrors: FormErrors = {};

    clearBasket() {
        this.basket.forEach(id => {
            this.removeCard(id);
        })
    }

    clearOrder() {
        this.order = {
            items: [],
            total: 0,
            address: '',
            email: '',
            phone: '',
            payment: ''
        }
    }

    removeCard(item: CardItem) {
        this.basket = this.basket.filter(val => val.id != item.id)
        this.emitChanges('basket:changed')

        this.basket.forEach(card => {
            this.order.items.push(card.id)
            this.order.items = [card.id]
        })
    }

    getTotal() {
        return this.basket.reduce((a, c) => a + c.price, 0)
    }

    setTotal(value: number) {
        return this.order.total = value
    }

    setBasket(item: CardItem) {
        this.basket.push(item)
        this.order.items.push(item.id)
        this.emitChanges('basket:changed')
    }

    isInBasket(item: CardItem) {
        return this.basket.includes(item)
    }

    setPreview(item: CardItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    setCatalog(items: ICard[]) {
        this.catalog = items.map(item => new CardItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        if (!this.order.payment) {
            errors.payment = 'Необходимо указать способ оплаты'
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}
