import React from 'react';
import ReactTooltip from 'react-tooltip'
import {CSSTransition, TransitionGroup } from 'react-transition-group'
import { ICardState, initialCardState } from 'src/Interfaces';
import { hideTooltip} from "./Card"

export interface ICardHolderProps{
	ch: {
		state: ICardState;
		cardHolderRef: React.RefObject<HTMLLabelElement>;
		onCardElementClick: (event: React.MouseEvent<HTMLElement, MouseEvent> | null, key: string) => void;
	}
}
export const CardHolder: React.FC<ICardHolderProps> = (
	{ ch: { 
		state,
		cardHolderRef,
		onCardElementClick,

	} }: ICardHolderProps) => {
	
	/**
	 * mouseEnterCH
	 * tooltip is visible only when card holder is in initial state: FULL NAME
	 */
	const mouseEnterCH = () => {
		const ch = cardHolderRef.current;
		if (!ch) return
		if (state.cardHolder === initialCardState.cardHolder) {
			ReactTooltip.show(ch)
			hideTooltip(ch, 4000)
		} else {
			ReactTooltip.hide(ch)
		}
	}
	return (
		<label
			className="card-item__info"
			ref={cardHolderRef}
			onClick={(evt) => onCardElementClick(evt, 'cardHolder')}
			data-tip='Click and type or Ctrl+Click<br>to copy Registration Name'
			data-place='top'
			data-effect='solid'
			data-offset="{'top': -30, 'left': 10}"
			onMouseEnter={mouseEnterCH}
		>
			<div className="card-item__holder">Card Holder</div>
			<div className="card-item__name">
				<TransitionGroup
					component="div"
					className="slide-fade-up"
				>
					{state.cardHolder === 'FULL NAME' ? (
						<CSSTransition
							classNames="slide-fade-up"
							timeout={250}
						>
							<span>FULL NAME</span>
						</CSSTransition>
					) : (
						state.cardHolder
							.split('')
							.map((val, ix) => (
								<CSSTransition
									timeout={250}
									classNames="slide-fade-right"
									key={ix}
								>
									<span className={`card-item__nameItem 
										${state.selectedLabel === 'cardHolder' &&
										ix + 1 === state.caretPosition ? 'yh-bold' : null}`}
									>
										{val===' ' ? <span className='underscore'>_</span> : val}
									</span>
								</CSSTransition>
							))
					)}
				</TransitionGroup>
			</div>
		</label>
	)
}
