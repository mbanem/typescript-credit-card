import React from 'react';
import { ICardState } from 'src/Interfaces';
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import { BACKGROUND_IMG } from './Card'

export interface IBackSideProps{
	bs: {
		state: ICardState
		cvcNumberRef: React.RefObject<HTMLDivElement>;
	}
}
export const CardBackside: React.FC<IBackSideProps> = ({ bs: { state, cvcNumberRef } }: IBackSideProps) => {
	/**
	 * make cvc visible on mouse enter
	 */
	const onMouseEnterCvc = () => {
		if (cvcNumberRef.current) {
			cvcNumberRef.current.innerText = state.cardCvc;
		}
	}
	/**
	 * mask cvc with ***
	 */
	const onMouseLeaveCvc = () => {
		if (cvcNumberRef.current) {
			cvcNumberRef.current.innerText = '***';
		}
	}
	return (
		<div className="card-item__side -back">
			<div className="card-item__cover">
				<img
					alt=""
					src={BACKGROUND_IMG}
					className="card-item__bg"
				/>
			</div>
			<div className="card-item__band" />
			<div className="card-item__cvc">
				<div className="card-item__cvcTitle">CVC</div>
				<div className="card-item__cvcBand"
					onMouseEnter={onMouseEnterCvc}
					onMouseLeave={onMouseLeaveCvc}
				>
					<div className='card-item__cvcNumber'
						ref={cvcNumberRef}
					>
						<TransitionGroup>
							{state.cardCvc.toString().split('').map((val, index) => (
								<CSSTransition
									classNames="zoom-in-out"
									key={index}
									timeout={250}
								>
									<span>*</span>
								</CSSTransition>
							))}
						</TransitionGroup>
					</div>
				</div>
				<div className="card-item__type">
					<img
						alt="card-type"
						src={'/card-type/visa.png'}
						className="card-item__typeImg"
					/>
				</div>
			</div>
		</div>
	)
}
