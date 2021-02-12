import React, { useState, useEffect, useRef } from 'react'

import ReactTooltip from 'react-tooltip'
import { IAppState, ICardState, initialCardState, IStyle, initialStyle } from '../Interfaces'
import { MonthWidget } from './MonthWidget'
import { YearWidget } from './YearWidget'
import { CardNumber, cardType, maskCardNum } from './CardNumber'
import { CardHolder } from './CardHolder'
import { getCaretPosition } from '../Utils/ShowCaretPosition';
import { CardBackground } from './CardBackground'
import { CardExpiration } from './CardExpiration'
import { CardBackside } from './CardBackside'
import { setTimeout } from 'timers'
import '../Styles/styles.scss'

type TValidate = (str: string) => [boolean, string]
type DRef = HTMLDivElement | null
type IRef = HTMLInputElement | null

export interface ICardProps {
  setAppState: (state: IAppState) => void
}
// todo find more images
export const BACKGROUND_IMG = '/card-background/0.jpeg'

// cannot persuade typescript that a function could return string | string[] based on flag
export const formatCardNumber = (cn: string, mask = true): string[] => {
	const pattern = mask ? '$1 **** **** $4' : '$1 $2 $3 $4'
	cn = (cn + '####********####'.slice(cn.length)).slice(0, 19)
	return (cn.replace(/(.{4,4})(.{4,4})(.{4,4})(.{4,4}).*/, pattern)).split('')
}
/**
 * Allows single spaces and dashed with no spaces around
 * @param value string to capitalize
 */
export const capitalize = (value: string): string => {
	return value.replace(/\s{2,}/g,' ').replace(/\s*-\s*/g,'-').replace(/^[a-z]|[ -][a-z]/g, (c) => c.toUpperCase())
}
/**
	 * allow specific tooltip for given interval necessary to easily read the tip
	 * @param ref 
	 * @param interval 
	 */
export const hideTooltip = (ref: HTMLDivElement | HTMLLabelElement | null, interval: number):void => {
	setTimeout(() => {
		ref && ReactTooltip.hide(ref)
	}, interval)
}
// ------------  THE CARD APP ----------------
export const Card: React.FC<ICardProps> = (props: ICardProps) => {
	const [style, setStyle] = useState<IStyle>(initialStyle)
	const [state, setState] = useState<ICardState>(initialCardState)
  
	const cardNumberRef = useRef<HTMLLabelElement>(null)
	const cardHolderRef = useRef<HTMLLabelElement>(null)
	const cardCvcRef = useRef<HTMLLabelElement>(null)

	const cardMonthRef = useRef<HTMLDivElement>(null)
	const cardYearRef = useRef<HTMLDivElement>(null)
	const cvcNumberRef = useRef<HTMLDivElement>(null)
	const monthWidgetRef = useRef<HTMLDivElement>(null)
	const yearWidgetRef = useRef<HTMLDivElement>(null)
	const errorMsgRef = useRef<HTMLDivElement>(null)
	const doneRef = useRef<HTMLDivElement>(null)
	const flipRef = useRef<HTMLDivElement>(null)

	const inputBoxRef = useRef<HTMLInputElement>(null)

	const maxEntryLength = { cardNumber: 16, cardHolder: 25, cardMonth: 2, cardYear: 2, cardCvc: 3 }
	const isValid = {
		cardNumber: (str: string) => {
			return state.cardNumber.replace(/\D/g,'').length === 16
				? /^[0-9]*$/.test(str)
					? [true, '']
					: [false, 'Only digits are allowed`']
				: [true,'partial card number']
		},
		cardHolder: (char: string) => /^[A-Za-z- ]*$/.test(char) ? [true, ''] : [false, 'Only letters, spaces amd dashes'],
		// amex uses 4-digit cvc and others 3-digit cvc
		cardCvc: (char: string) => {
			const ref = inputBoxRef.current
			const inputLnt = ref ? ref.value.length : 0
			const type = cardType(state.cardNumber)
			const lnt = type === 'amex' ? 4 : 3
			return (/^[0-9]+$/.test(char) && (inputLnt <= lnt)) ? [true, ''] : [false, `Up to ${lnt + 1} digits allowed'`]
		}
	}
	const nameValidator: TValidate = (value: string): [boolean, string] => {
		// dash must be between at least two chars
		// if (
		// 	value
		// 		.split('-')
		// 		.reduce((min, c) => (c.length < min ? c.length : min), 100) < 2
		// ) {
		// 	return [false,'Min 2 chars around a dash']
		// }
		if (value.match(/[^A-Za-z- ]/)) {
			return [false, 'Only letters spaces and dashes']
		}
		return [true, '']
	}
	/**
	 * setError - ignores keystroke do to error
	 * @param key - state key for entry
	 * @param msg 
	 * @param err 
	 * @param inp - input box reference.current
	 */
	const setError = (key: string, msg: string, err: DRef = errorMsgRef.current, inp: IRef = inputBoxRef.current) => {
		if (!err || !inp) return
		err.innerText = msg
		err.classList.remove('hide')
		inp.value = state[key]
		onCardElementClick(null, key)
	}
	/**
	 * setFlipButtonVisibility
	 * when Card Number, Holder, MOnth and Year are entered,
	 * flip button gets available to allow setting cvc
	 */
	const setFlipButtonVisibility = (): boolean => {
		const fb = flipRef.current
		const tf = /^\d+$/.test(state.cardNumber) && state.cardNumber.length === 16
			&& state.cardHolder.length > 5
			&& state.cardHolder !== 'FULL NAME'
			&& /^\d{2,2}$/.test(state.cardMonth)
			&& /^\d{2,2}$/.test(state.cardYear)
		// console.log('ft,tf', fb,tf)
    
		if (fb) {
			if (tf) {
				fb.classList.remove('hide')
				flipCard(false)
			} else {
				fb.classList.add('hide')
			}
		}
		return tf
	}
	/**
	 * setDoneButtonVisibility
	 * when card number, holder name, month, year and cvc are entered
	 * the done button become available to send card data to the main app
	 */
	const setDoneButtonVisibility = () => {
		const db = doneRef.current
		const tf = setFlipButtonVisibility()
			&& /^\d{3,4}$/.test(state.cardCvc)
		if (db) {
			if (tf) {
				db.classList.remove('hide')
			} else {
				db.classList.add('hide')
			}
		}    
	}

	/**
	 * to handle mouseEnter for Card Number separate state is used
	 * to avoid saving masked card number is regular state as users
	 * can change focus at any time and then we need to set correct 
	 * state card number in the state again
	 */
	const [cardNum, setCardNum] = useState<string[]>(maskCardNum(state.cardNumber));
	
	/**
	 * handleInput - input box React onChange handler
	 * controls allowed chars and renders error if any
	 * @param event.target.value 
	 */
	const handleInput = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
		const key = state.selectedLabel
		const err = errorMsgRef.current
		// ignore keystrokes if out of max length
		if (value.length > maxEntryLength[key] && inputBoxRef.current) {
			inputBoxRef.current.value = state[key]
			return
		}
		// regex validation for different entries (name,number,cvc)
		const [valid, error] = isValid[key](value)
		// if cardNumber is not complete isValid returns [true,''] but no error
		if (!valid && err) {
			if (error) {
				setError(key, error)
			}
			return
		}
		// name validator for dashes
		if (key === 'cardHolder') {
			const [valid, error] = nameValidator(state.cardHolder + value)
			if (!valid && err) {
				setError(key, error)
				return
			}
		}
		setState({ ...state, [key]: value })
		if (key === 'cardNumber') {
			setCardNum(maskCardNum(value))
		}
		if (err && !err.classList.contains('hide')) {
			err.classList.add('hide')
		}
	}
	/**
 * highlightCaretPosition based on input caret positions
 * highlights char in label adding caret as border-right vertical line
 * @param event 
 */
	const highlightCaretPosition = (event: React.KeyboardEvent<HTMLInputElement>) => {
		const ref = inputBoxRef.current
		const pos = getCaretPosition(event, ref, state.selectedLabel)
		if (ref) {
			ref.value = ref.value.trim()
		}
		if (pos > 0) {
			setState({ ...state, caretPosition: pos })
		}
	}
	/**
	 * updateAppState - after user completes CreditCard sends data to main app
	 */
	const updateAppState = () => {
		const apps = {
			cardNumber: state.cardNumber.replace(/(\d4,4})/g, '$1 ').trimRight(),
			cardHolder: capitalize(state.cardHolder),
			cardMonth: state.cardMonth,
			cardYear: state.cardYear,
			cardCvc: state.cardCvc,
		}
		props.setAppState(apps)
	}
	/**
	 * setStateDate clicked Month/Year is saved in state and hide the widget
	 * @param event 	- holds reference to clicked number
	 * @param dateKey 	- ke for state entry
	 * @param refWidgetKey - ref of rendered block to hide
	 */
	const setStateDate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, dateKey: string, refWidgetKey: string) => {
		const d = event.target as HTMLDivElement;
		const value = `0${d.innerText}`.slice(-2); // leading zero if single digit
		setState({ ...state, [dateKey]: value });
		refFromKey[refWidgetKey].current.classList.toggle('hide');
	}
	/**
	 * refFromKey
	 * state items are based on keys and supporting UI references
	 * are key+Ref so from the key we get reference to its UI elements
	 */
	const refFromKey = {
		cardNumber: cardNumberRef,
		cardHolder: cardHolderRef,
		cardMonth: cardMonthRef,
		cardYear: cardYearRef,
		cardCvc: cardCvcRef,
		monthWidget: monthWidgetRef,
		yearWidget: yearWidgetRef,
	}

	/**
	 * onCardElementClick
	 * every UI element on click gets rounded box as visual focus indicator
	 * and input box gets focus and its content cleared or set previous content
	 * @param event 
	 * @param key 
	 */
	const onCardElementClick = (event: React.MouseEvent<HTMLElement, MouseEvent> | null, key: string) => {
	
		ReactTooltip.hide(refFromKey[key].current)
		const input = inputBoxRef.current
		// could be called out of existing event, so if event is present we stop bubbling
		// as clicking on YY will propagate to MM and MM will be left asa event context
		if (event) {
			event.stopPropagation();
		}
		if (!input) return
		setState({
			...state,
			selectedLabel: key,
			previousElementRef: state.currentElementRef,
			currentElementRef: refFromKey[key === 'cardYear' ? 'cardMonth' : key],
			caretPosition: -1,
		})
		// if Month or Year is selected show select Block instead of input inputBox
		if ('cardMonth|cardYear'.includes(key)) {
			const blockKey = key[4].toLowerCase() + key.slice(5) + 'Widget';
			// close month/year if already open when the opposite is selected
			const oppositeBlock = { monthWidget: yearWidgetRef, yearWidget: monthWidgetRef };
			const opp = oppositeBlock[blockKey].current;

			if (opp && !opp.classList.contains('hide')) {
				opp.classList.toggle('hide');
			}
			const ref = refFromKey[blockKey].current
			if (ref) {
				ref.classList.toggle('hide');
			}
		} else if (key === 'cardHolder' && event && event.ctrlKey) {
			if (cardHolderRef.current) {
				ReactTooltip.hide(cardHolderRef.current)
			}
			setState({
				...state,
				cardHolder: state.userName,
				selectedLabel: 'cardHolder',
				currentElementRef: cardHolderRef
			})
			setTimeout(() => {
				input.value = state.userName+' '
				input.selectionStart = input.value.length+1
				// setState({ ...state, caretPosition: input.value.length })
				// input.selectionStart = input.value.length - 1
			}, 1000)
		}
		
		// console.log('state[key]', key,state[key]);
		
		// if (input) {
		input.value = state[key] === initialCardState[key] ? '' : state[key];
		input.focus();
		// }
	}


	/**
	 * shown only when front part elements are filled to reveal the card back side
	 */
	const flipCard = (checkDoneButton:boolean) => {
		const fc = !state.isCardFlipped;
		const input = inputBoxRef.current;
		if (fc && state.cardNumber.length === 16) {
			onCardElementClick(null, 'cardCvc');
			setState({
				...state,
				isCardFlipped: fc,
				selectedLabel: 'cardCvc',
				currentElementRef: cardCvcRef,
			});
			if (input) {
				input.value = state.cardCvc === initialCardState.cardCvc ? '' : state.cardCvc;
			}
		} else {
			setState({
				...state,
				isCardFlipped: fc,
				currentElementRef: null
			});
			if (input) {
				input.value = '';
			}
		}
		if (checkDoneButton) {
			setDoneButtonVisibility()
		}
	}

	/**
	 * this is not resource hog function but is used as an example
	 */
	// const useCardType = useMemo(() => {
	// 	return cardType();
	// }, [state.cardNumber])

	/**
	 * set css class for rounded border box around a given element
	 * @param element 
	 */
	const outlineElementStyle = (element: HTMLLabelElement | HTMLDivElement) => {
		return element
			? {
				width: `${element.offsetWidth}px`,
				height: `${element.offsetHeight}px`,
				transform: `translateX(${element.offsetLeft}px) translateY(${element.offsetTop}px)`
			}
			: null;
	}

	/**
	 * sets css for rounded bordered box when style state is set to
	 * and makes visible flip and done buttons when appropriate entries are make
	 */
	useEffect(() => {
		if ( state.currentElementRef && state.currentElementRef.current) {
			const style = outlineElementStyle(state.currentElementRef.current);
			if (style) {
				setStyle(style);
			}
			setDoneButtonVisibility();
		}
	}, [state])

	return (
		<>
			<div className={'card-item ' + (state.isCardFlipped ? '-active' : '')}>
				<div className="card-item__side -front">
					<CardBackground cb={{ state, style}}/>
					<div className="card-item__wrapper">
						<CardNumber cardNum={{state,cardNumberRef,onCardElementClick,cardNum,setCardNum	}} />
						<div className="card-item__content">
							<CardHolder ch={{state, cardHolderRef, onCardElementClick}}/>
							<CardExpiration ce={{state,cardMonthRef,cardYearRef,onCardElementClick}}/>
						</div>
					</div>
					<div className="card-input">
						<input
							type="text"
							className='input-box'
							maxLength={40}
							autoComplete="off"
							name="inputBox"
							onChange={handleInput}
							ref={inputBoxRef}
							onKeyUp={highlightCaretPosition}
						/>
					</div>
				</div>

				<CardBackside bs={{ state, cvcNumberRef }}/>
				<div ref={errorMsgRef} className="error-msg hide"></div>
				
				<div className="month-block hide"
					ref={monthWidgetRef}
					onClick={(evt) => setStateDate(evt, 'cardMonth','monthWidget')}
				>
					<MonthWidget />
				</div>
				<div className="year-block hide"
					ref={yearWidgetRef}
					onClick={(evt) => setStateDate(evt, 'cardYear','yearWidget')}
				>
					<YearWidget />
				</div>
				<ReactTooltip className='tooltip-expire'
					multiline={true}
					event="mouseEnter"
					delayHide={600}/>
				<div ref={doneRef} className='done-button hide' onClick={updateAppState}>done</div>
				<div ref={flipRef} className='flipper-button hide' onClick={()=>flipCard(true)}>flip card</div>
			</div>
		</>
	)
}

