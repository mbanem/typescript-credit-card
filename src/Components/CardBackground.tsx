import React from 'react';
import { ICardState, IStyle } from 'src/Interfaces';
import { BACKGROUND_IMG } from './Card'
export interface ICardBackgroundProps{
	cb: {
		state: ICardState;
		style: IStyle;
	}
}
export const CardBackground: React.FC<ICardBackgroundProps> = ({cb:{state, style}}:ICardBackgroundProps) => {

	return (
		<>
			<div
				className={`card-item__focus ${state.currentElementRef ? `-active` : ``}`}
				style={style}
			/>
			<div className="card-item__cover">
				<img
					alt=""
					src={BACKGROUND_IMG}
					className="card-item__bg"
				/>
			</div>
		</>
	)
}