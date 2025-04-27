import React from "react";

// Simplified Slider component without Radix UI
const Slider = React.forwardRef(
	(
		{ className, value, onValueChange, min = 0, max = 100, step = 1, ...props },
		ref
	) => {
		const handleChange = (e) => {
			const newValue = parseInt(e.target.value);
			if (onValueChange) {
				onValueChange([newValue]);
			}
		};

		return (
			<div
				className={`relative flex w-full items-center ${className}`}
				{...props}
			>
				<input
					ref={ref}
					type='range'
					min={min}
					max={max}
					step={step}
					value={Array.isArray(value) ? value[0] : value}
					onChange={handleChange}
					className='w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer'
				/>
			</div>
		);
	}
);

Slider.displayName = "Slider";

export { Slider };
