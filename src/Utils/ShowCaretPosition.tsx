import React from 'react'
// const skip = { ArrowLeft: -1, ArrowRight: 1 }

export const getCaretPosition = (
	event: React.KeyboardEvent<HTMLInputElement>, 
	el: HTMLInputElement | null,
	selectedLabel: string): number => {	
	if (!el ||
		el.selectionStart === null ||
    !"ArrowLeft|ArrowRight|Backspace|Delete|ArrowUp|ArrowDown|Home|End|PageUp|PageDown".includes(event.key)
	) {
		return 0
	}
	// probably for MS Explorer workaround
	// const pos = el.value.slice(0, el.selectionStart).length
	let pos = el.selectionStart;
	// console.log('selectionStart',  pos);
	
	if (selectedLabel === 'cardNumber') {
		// 4-digit groups are space separated, so pos should skip spaces
		pos += pos === 0 ? 1 : Math.floor((pos) / 4) + 1;
		// if ([4, 9, 13].includes(pos)){
		// 	pos += skip[event.key]
		// }
	}else if (event.key === 'Backspace') {
		pos += 1;
	}
	// console.log('fixed pos', pos);
	
	return pos;
}


