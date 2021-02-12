export interface ICardState {
	selectedLabel: string
	cardHolder: string
	cardNumber: string
	cardMonth: string
	cardYear: string
	cardCvc: string
	isCardFlipped: boolean
	currentElementRef: React.RefObject<HTMLLabelElement|HTMLDivElement>|null
  previousElementRef: React.RefObject<HTMLLabelElement|HTMLDivElement>|null
	caretPosition: number
	userName: string
}

export const initialCardState: ICardState = {
	selectedLabel: '',
	cardHolder: 'FULL NAME',
	cardNumber: '####********####',
	cardMonth: 'MM',
	cardYear: 'YY',
	cardCvc: '***',
	isCardFlipped: false,
	currentElementRef: null,
	previousElementRef: null,
	caretPosition: -1,
	userName: 'Mili Milutinovic'
}
export interface IAppState {
	cardNumber: string
	cardHolder: string
	cardMonth: string
	cardYear: string
	cardCvc: string
}
export const initialAppState = {
	cardNumber: '',
	cardHolder: '',
	cardMonth: '',
	cardYear: '',
	cardCvc: '',
}

export interface IStyle {
	width: string
	height: string
	transform: any
}
export const initialStyle = {
	width: '100%',
	height: '100%',
	transform: null,
}
