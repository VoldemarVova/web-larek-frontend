import { Form } from "./common/Form";
import { IOrder } from '../types';
import { IEvents } from './base/events';

export class Order extends Form<IOrder> {
    protected _paymentCardButton?: HTMLButtonElement
    protected _paymentCashButton?: HTMLButtonElement
    protected _addressInput?: HTMLInputElement
    protected _emailInput?: HTMLInputElement
    protected _phoneInput?: HTMLInputElement
    protected _total?: number

    constructor(container: HTMLFormElement, events?: IEvents) {
        super(container, events);

        this._paymentCardButton = container.querySelector('button[name="card"]')
        this._paymentCashButton = container.querySelector('button[name="cash"]')
        this._addressInput = container.querySelector('input[name="address"]')
        this._emailInput = container.querySelector('input[name="email"]')
        this._phoneInput = container.querySelector('input[name="phone"]')

        if (this._paymentCardButton && this._paymentCashButton) {
            this._paymentCardButton.addEventListener('click', () => {
                this.onInputChange('payment', 'online')
                this.payment = 'online'
            })

            this._paymentCashButton.addEventListener('click', () => {
                this.onInputChange('payment', 'offline')
                this.payment = 'offline'
            })
        }
    }

    protected setPaymentMethodActive(activeBtn: HTMLButtonElement, inactiveBtn: HTMLButtonElement) {
        this.toggleClass(activeBtn, 'button_alt-active', true)
        this.toggleClass(inactiveBtn, 'button_alt-active', false)
    }

    set payment(value: string) {
        if (value === 'online') {
            this.setPaymentMethodActive(this._paymentCardButton, this._paymentCashButton)
        } else if (value === 'offline') {
            this.setPaymentMethodActive(this._paymentCashButton, this._paymentCardButton)
        }
    }

    set address(value: string) {
        this._addressInput.value = value
    }

    set email(value: string) {
        this._emailInput.value = value;
    }

    set phone(value: string) {
        this._phoneInput.value = value;
    }
}
