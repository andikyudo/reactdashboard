import React from "react";

// Simplified Progress component without Radix UI
const Progress = ({ className, value = 0, ...props }) => {
	return (
		<div
			className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
			{...props}
		>
			<div
				className='h-full bg-blue-500 transition-all'
				style={{ width: `${value}%` }}
			/>
		</div>
	);
};

export { Progress };
