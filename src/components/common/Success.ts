import {View} from '../base/View';
import {ensureElement} from "../../utils/utils";

interface ISuccess {
    total: number;
}

interface ISuccessActions {
    onClick: () => void;
}

export class Success extends View<ISuccess> {
    protected _close: HTMLElement;
    protected _text: HTMLElement;

    constructor(container: HTMLElement, actions: ISuccessActions) {
        super(container);

        this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
        this._text = ensureElement<HTMLElement>('.order-success__description', this.container)

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }
    set total(total: number) {
        const string = `Списано ${total} синапсов`
        this.setText(this._text, string)
    }
}
