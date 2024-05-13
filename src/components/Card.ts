import {View} from './base/View';
import {ICard} from "../types";
import {ensureElement} from "../utils/utils";

interface ICardActions {
    onClick?: (event: MouseEvent) => void;
    onSend?: () => void;
    onDelete?: () => void;
}

export class Card extends View<ICard> {
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _button?: HTMLButtonElement;
    protected _description?: HTMLElement;
    protected _category?: HTMLElement;
    protected _price: HTMLElement;
    protected _index?: HTMLSpanElement;
    protected _deleteButton?: HTMLButtonElement;
    protected _form?: HTMLFormElement

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._price = ensureElement<HTMLSpanElement>(`.${blockName}__price`, container);
        this._image = container.querySelector(`.${blockName}__image`);
        this._button = container.querySelector(`.button`);
        this._description = container.querySelector(`.${blockName}__text`);
        this._category = container.querySelector(`.${blockName}__category`);
        this._index = container.querySelector('.basket__item-index');
        this._deleteButton = container.querySelector('.basket__item-delete')
        this._form = container.querySelector('.form')

        if (actions?.onClick) {
            container.addEventListener('click', actions.onClick);
        }

        if (this._deleteButton) {
            this._deleteButton.addEventListener('click', () => {
                actions.onDelete()
            })
        }

        if (this._button) {
            this._button.addEventListener('click', (event) => {
                event.preventDefault();
                actions?.onSend()
            })
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set description(value: string) {
        this.setText(this._description, value)
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || ''
    }

    set category(value: string) {
        this.setText(this._category, value)
    }

    set price(value: number | null) {
        if (typeof value === 'number') {
            this.setText(this._price, value + ` синапсов`)
        } else {
            this.setText(this._price,`Бесценно`)
        }
    }

    set index(value: string) {
        this.setText(this._index, value)
    }

    setButtonOff(value: boolean | null) {
        if (value === true) {
            this.setDisabled(this._button, true)
            this.setText(this._button, 'Уже в корзине')
        }
        if (value === null) {
            this.setDisabled(this._button, true)
            this.setText(this._button, 'Нельзя купить')
        }
    }
}
