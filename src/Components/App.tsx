import React from 'react';
import '../Styles/App.scss';
import { Card } from './Card';
import { IAppState, initialAppState } from '../Interfaces';

export const App: React.FC = () => {
	const [state, setState] = React.useState<IAppState>(initialAppState);
	console.log(state.cardHolder);
  
	const updateAppState = (stateObj: IAppState) => {
		setState(stateObj);
		console.log('stateObj', stateObj);
	}
	return (
		<div className="App">
			<Card  setAppState={updateAppState} />
		</div>
	)
}
