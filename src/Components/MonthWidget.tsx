import React from 'react'

/**
 * MonthWidget
 * renders months 01..12 as div elements inside a div wrapper
 */
export const MonthWidget: React.FC = () => {

	return (
		<>
			{Array(12).fill(0).map((_,ix) => (
				<div key={ix+10}>{ix + 1}</div>
			))}
		</>
	)
}