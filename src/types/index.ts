export interface ICard {
	id: string,
	description: string,
	image: string,
	title: string,
	category: string,
	price: number,
	index: number,
	total: number,
	button?: string,
}

export interface IBasketView {
	items: HTMLElement[],
	selected: HTMLElement[],
	total: number
}

export interface IAppState {
	catalog: ICard[],
	basket: string[],
	preview: string | null,
	order: IOrder | null
}

export interface IOrderForm {
	payment?: string,
	email?: string,
	phone?: string,
	address?: string
}

export interface IOrder extends IOrderForm {
	items: string[],
	total: number
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
	id: string
}
