import './scss/styles.scss';

import { LarekAPI } from "./components/LarekAPI";
import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from './components/base/Events';
import { AppData, CardItem, CatalogChangeEvent } from "./components/AppData";
import { Page } from "./components/Page";
import { Card } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { Modal } from "./components/common/Modal";
import { Basket } from './components/Basket';
import { IOrderForm } from './types';
import { OrderForm } from "./components/Order";
import { Success } from './components/Success';

const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
})

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog')
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview')
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket')
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket')
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts')
const orderTemplate = ensureElement<HTMLTemplateElement>('#order')
const successTemplate = ensureElement<HTMLTemplateElement>('#success')

// Модель данных приложения
const appData = new AppData({}, events)

// Глобальные контейнеры
const page = new Page(document.body, events)
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events)

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events)
const order = new OrderForm(cloneTemplate(orderTemplate), events)
const contacts = new OrderForm(cloneTemplate(contactsTemplate), events)

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map(item => {
		const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item)
		})
		return card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
		})
	})
})

events.on('card:select', (item: CardItem) => {
	appData.setPreview(item)
})

events.on('preview:changed', (item: CardItem) => {
	const showItem = (item: CardItem) => {
		const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
				onSend: () => {
					appData.setBasket(item)
					page.counter = appData.basket.length
					card.setButtonOff(true)
				}
			}
		)
		if (item.price === null) {
			card.setButtonOff(null)
		}
		if (appData.isInBasket(item)) {
			card.setButtonOff(true)
		}
		modal.render({
			content: card.render({
				title: item.title,
				image: item.image,
				category: item.category,
				description: item.description,
				price: item.price,
				button: item.button,
			})
		})
	}
	if (item) {
		api.getProductItem(item.id)
			.then((result) => {
				item.description = result.description
				showItem(item);
			})
			.catch((err) => {
				console.error(err)
			})
	} else {
		modal.close();
	}
})

events.on('basket:changed', () => {
	page.counter = appData.basket.length
	basket.total = appData.getTotal()
	basket.items = appData.basket.map((item, index) => {
		const card = new Card('card', cloneTemplate(cardBasketTemplate), {
			onDelete: () => {
				appData.removeCard(item)
			}
		})
		return card.render({
			title: item.title,
			price: item.price,
			index: index + 1,
		})
	})
})

events.on('basket:open', () => {
	modal.render({
		content: createElement<HTMLElement>('div', {}, [
			basket.render({
			})
		])
	})
})

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
	appData.setOrderField(data.field, data.value)
})

// Изменилось одно из полей
events.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
	appData.setOrderField(data.field, data.value)
})

// Изменилось состояние валидации формы оплаты и адреса
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { payment, address } = errors
	order.valid = !payment && !address
	order.errors = Object.values({ payment, address }).filter(i => !!i).join('; ')
})

// Изменилось состояние валидации формы почты и телефона
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors
	contacts.valid = !email && !phone
	contacts.errors = Object.values({ phone, email }).filter(i => !!i).join('; ')
})

events.on('order:open', () => {
	modal.render({
		content: order.render({
			total: appData.setTotal(appData.getTotal()),
			address: '',
			valid: false,
			errors: []
		})
	})
})

events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: []
		})
	})
})

events.on('contacts:submit', () => {
	api.postOrder(appData.order)
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close()
					events.emit('basket:changed')
					appData.clearBasket()
					appData.clearOrder()
				}
			})
			modal.render({
				content: success.render({
					total: appData.getTotal()
				})
			})
			appData.clearBasket()
			page.counter = appData.basket.length
		})
		.catch(err => {
			console.error(err)
		})
})


// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true
})

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false
})

// Получаем лоты с сервера
api.getProductList()
	.then(appData.setCatalog.bind(appData))
	.catch(err => {
		console.error(err)
	})
