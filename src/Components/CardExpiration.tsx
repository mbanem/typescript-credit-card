import React from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import ReactTooltip from 'react-tooltip'
import { ICardState, initialCardState } from '../Interfaces/'
import { hideTooltip } from './Card'

export interface ICardExpirationProps{
	ce: {
		state: ICardState;
		cardMonthRef: React.RefObject<HTMLDivElement>;
		cardYearRef: React.RefObject<HTMLDivElement>;
		onCardElementClick: (event: React.MouseEvent<HTMLElement, MouseEvent> | null, key: string) => void;
	}
}
export const CardExpiration: React.FC<ICardExpirationProps> = (
	{
		ce: { 
			state,
			cardMonthRef,
			cardYearRef,
			onCardElementClick,
		}
	}: ICardExpirationProps) => {
	/**
	 * tooltip is activated on entering the wrapper for month, year and  Expires UI elements
	 */
	const mouseEnterDate = () => {
		const dt = cardMonthRef.current
		if (!dt) return
		if (state.cardMonth === initialCardState.cardMonth && state.cardYear === initialCardState.cardYear
			&& (state.selectedLabel === '' || !'cardMonth|cardYear'.includes(state.selectedLabel))) {
			ReactTooltip.show(dt)
			hideTooltip(dt, 2000)
		} else {
			ReactTooltip.hide(dt)
		}
	}
	return (
		<div
			className="card-item__date"
			ref={cardMonthRef}
			onMouseEnter={mouseEnterDate}
			onClick={(evt) => onCardElementClick(evt, 'cardMonth')}
			data-tip={`Click on MM/YY<br>to select`}
			data-place='top'
			data-effect='solid'
			data-offset="{'top': -30, 'left': 10}"
		>
			<label className="card-item__dateTitle">
			Expires
			</label>
			<label className="card-item__dateItem"
				onClick={(evt) => onCardElementClick(evt, 'cardMonth')}
			>
				<SwitchTransition in-out>
					<CSSTransition
						classNames="slide-fade-up"
						timeout={200}
						key={state.cardMonth}
					>
						<span>
							{!state.cardMonth ? 'MM' : state.cardMonth}{' '}
						</span>
					</CSSTransition>
				</SwitchTransition>
			</label>
			/
			<div
				className="card-item__dateItem"
				ref={cardYearRef}
				onClick={(evt) => onCardElementClick(evt, 'cardYear')}
			>
				<SwitchTransition out-in>
					<CSSTransition
						classNames="slide-fade-up"
						timeout={250}
						key={state.cardYear}
					>
						<span>
							{!state.cardYear
								? 'YY'
								: state.cardYear
									.toString()
									.substr(-2)}
						</span>
					</CSSTransition>
				</SwitchTransition>
			</div>
		</div>
	)
}
