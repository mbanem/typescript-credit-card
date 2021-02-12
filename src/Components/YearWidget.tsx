import React from 'react'

/**
 * YearWidget
 * render nine consecutive years as div elements inside a div wrapper
 */
export const YearWidget: React.FC = () => {
	const year = new Date().getFullYear()%100

	return (
		<>
			{Array(9).fill(0).map((_,ix) => (
				<div key={year+ix}>{year+ix}</div>
			))}
		</>
	)
}
