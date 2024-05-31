"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
	const [bpm, setBpm] = useState("");
	const [values, setValues] = useState([]);

	function addValue() {
		const newValues = values;
		newValues.push(new Date());
		const bpmTab = [];
		for (let i = 0; i < newValues.length - 1; i++) {
			let total = 0;
			let coef = 0;
			for (let j = i + 1; j < newValues.length; j++) {
				total += 60000 / (newValues[j] - newValues[i]) * (j - i) * ((j - i) * (j - i) / 2);
				coef += ((j - i) * (j - i) / 2);
			}
			bpmTab.push(total / coef);
		}
		console.log(bpmTab);
		if (newValues.length > 2) {
			let total = 0;
			for (let i = 0; i < bpmTab.length; i++) {
				total += bpmTab[i];
			}
			setBpm((total / bpmTab.length).toFixed(2));
		}
		setValues(newValues);
	}
	function handleReset(e) {
		e.stopPropagation();
		setValues([]);
		setBpm("");
	}
	return (
		<main onClick={addValue} tabIndex="0" onKeyDown={(e) => {if (e.key === ' ') {e.preventDefault(); addValue();}}}>
			<h1>{bpm}</h1>
			<div onClick={handleReset} className="reset-button">
				<div></div>
			</div>
		</main>
	);
  }