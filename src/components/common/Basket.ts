import { createElement, ensureElement, formatNumber } from "../../utils/utils";
import { EventEmitter } from "../base/events";
import { View } from '../base/View';
import { IBasketView } from '../../types';

export class Basket extends View<IBasketView> {
    protected _list: HTMLElement;
    protected _button: HTMLElement;
    protected _total: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._button = this.container.querySelector('.basket__button');
        this._total = this.container.querySelector('.basket__price');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }
        this.items = [];
    }

    set items(items: HTMLElement[]) {
        if (items.length) {
            this._list.replaceChildren(...items)
            this.setDisabled(this._button, false)
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
            this.setDisabled(this._button, true);
        }
    }

    set selected(items: string[]) {
        if (items.length) {
            this.setDisabled(this._button, false);
        } else {
            this.setDisabled(this._button, true);
        }
    }

    set total(total: number) {
        if (this._total) {
            this.setText(this._total, `${total} синапсов`);
        }
    }
}
