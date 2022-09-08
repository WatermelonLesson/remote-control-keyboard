// window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000;

console.clear();

/* -- Never user-mutable. -- */

const KeyboardSettings = {
	BACKSPACE : 0,
	CAPS_LOCK : 1,
	SHIFT : 2,
	RETURN : 3
}

const SpecialCharacters = [
	"!",
	"@",
	"#",
	"$",
	"%",
	"^",
	"&",
	"*",
	"(",
	")",
	"_",
	"+",
	"{",
	"}",
	"|",
	":",
	"&#34;",
	"<",
	">",
	"?"
];
	
const ControlCharacters = [
	KeyboardSettings.BACKSPACE,
	KeyboardSettings.CAPS_LOCK,
	KeyboardSettings.SHIFT
];

/* -- Potentially mutable variables in the future -- */

const DEBUGGING = true;
const SLEEP_TIMER = 25;

/* -- Variables -- */

let message = "";
let path = "";

let buttons = Array.from(document.querySelector("form.remote-control").children);

let keyboard = document.querySelector(".keyboard");

let currentRow = 1;
let currentKeyIndex = getIndex(document.querySelector(".current-key"));

let keyboardKeys = new Array(document.querySelectorAll(".keyboard > ul").length);

let kbSettings = -1;

for (let i = 0; i < keyboardKeys.length; ++i)
{
	keyboardKeys[i] = Array.from(document.querySelectorAll(".keyboard > ul")[i].children, (e) => [e.dataset.lowercase, e.dataset.uppercase]);
}

document.querySelector("form.remote-control").addEventListener("click", function (e) {
	e.preventDefault();
	
	if (document.querySelector(".key-selected") !== null)
	{
		document.querySelector(".key-selected").classList.remove("key-selected");
	}
	
	if (e.target !== buttons[4])
	{
		keyboard.children[currentRow].children[currentKeyIndex].classList.remove("current-key");
		
		if (e.target === buttons[0])
		{
			/* -- UP -- */
			currentRow--;
			
			if (keyboard.children[currentRow].children.length <= currentKeyIndex)
			{
				currentKeyIndex = keyboard.children[currentRow].children.length - 1;
			}
		}
		else if (e.target === buttons[1])
		{
			/* -- LEFT -- */
			currentKeyIndex--;
		}
		else if (e.target === buttons[2])
		{
			/* -- RIGHT -- */
			currentKeyIndex++;
		}
		else
		{
			/* -- DOWN -- */
			currentRow++;
			
			if (keyboard.children[currentRow].children.length <= currentKeyIndex)
			{
				currentKeyIndex = keyboard.children[currentRow].children.length - 1;
			}
		}
		
		keyboard.children[currentRow].children[currentKeyIndex].classList.add("current-key");
	}
	else
	{
		/* -- SUBMIT -- */
		
		if (!keyboard.children[currentRow].children[currentKeyIndex].classList.contains("control-character"))
		{
			if (kbSettings === KeyboardSettings.CAPS_LOCK || kbSettings === KeyboardSettings.SHIFT)
			{
				path += "Select (" + keyboard.children[currentRow].children[currentKeyIndex].dataset.uppercase + "), ";
				
				message += keyboard.children[currentRow].children[currentKeyIndex].dataset.uppercase;
				
				if (kbSettings === KeyboardSettings.SHIFT)
				{
					kbSettings = -1;
					keyboard.classList.remove("shift-enabled");
				}
			}
			else
			{
				path += "Select (" + keyboard.children[currentRow].children[currentKeyIndex].dataset.lowercase + "), ";
				message += keyboard.children[currentRow].children[currentKeyIndex].dataset.lowercase;
			}
		}
		else
		{
			path += "Select (" + keyboard.children[currentRow].children[currentKeyIndex].textContent + "), ";
			let character = parseInt(keyboard.children[currentRow].children[currentKeyIndex].dataset.lowercase);
			
			if (kbSettings === character)
			{
				keyboard.classList.remove("shift-enabled");
				kbSettings = -1;
			}
			else
			{
				if (character === KeyboardSettings.BACKSPACE)
				{
					message = message.slice(0, message.length - 1);
				}
				else if (character === KeyboardSettings.RETURN)
				{
					message += "\n";
				}
				else
				{
					kbSettings = character;
					keyboard.classList.add("shift-enabled");
					
					if (DEBUGGING)
					{
						console.log("Enabling shift?: " + (character === KeyboardSettings.SHIFT));
					}
				}
			}
		}
		
		keyboard.children[currentRow].children[currentKeyIndex].classList.add("key-selected");
	}
	
	/* -- This is where it gets bad... -- */
	
	for (i = 0; i < buttons.length - 1; ++i)
	{
		enableButton(i);
	}
	
	if (currentRow === 0)
	{
		disableButton(0);
	}
	if (currentRow === keyboard.children.length - 1)
	{
		disableButton(3);
	}
	if (currentKeyIndex === 0)
	{
		disableButton(1);
	}
	if (currentKeyIndex === keyboard.children[currentRow].children.length - 1)
	{
		disableButton(2);
	}
});

document.querySelector("form.message-input").addEventListener("click", async function (e) {
	e.preventDefault();
	
	if (e.target.type === "submit")
	{
		e.target.disabled = true;
		
		if (DEBUGGING)
			console.log(e.target.disabled);
		
		await visualizeMessage(document.querySelector("#user-msg").value);
		followPath(document.querySelector("#user-direction").value);
		
		e.target.disabled = false;
	}
});

function disableButton(buttonNumber)
{
	if (buttons[buttonNumber].getAttribute("disabled") === null)
	{
		buttons[buttonNumber].setAttribute("disabled", "");
	}
}

function enableButton(buttonNumber)
{
	if (buttons[buttonNumber].getAttribute("disabled") !== null)
	{
		buttons[buttonNumber].removeAttribute("disabled");
	}
}

/* -- This is where it stops being bad. -- */

function getIndex(key)
{
	return Array.from(key.parentElement.children).indexOf(key);
}

// Up, Down
// [Up], [ Down]
function followPath(gPath)
{
	let gPathSplit = gPath.split(",");
	let paragraph = document.createElement("p");
	
	for (let i = 0; i < gPathSplit.length; ++i)
	{
		gPathSplit[i] = gPathSplit[i].replace(/\s+/g, '');
		
		if (gPathSplit[i].toUpperCase() === "UP")
		{
			if (DEBUGGING)
			{
				console.log("Up");
			}
			
			buttons[0].click();
		}
		else if (gPathSplit[i].toUpperCase() === "LEFT")
		{
			if (DEBUGGING)
			{
				console.log("Left");
			}
			
			buttons[1].click();
		}
		else if (gPathSplit[i].toUpperCase() === "RIGHT")
		{
			if (DEBUGGING)
			{
				console.log("Right");
			}
			
			buttons[2].click();
		}
		else if (gPathSplit[i].toUpperCase() === "DOWN")
		{
			if (DEBUGGING)
			{
				console.log("Down");
			}
			
			buttons[3].click();
		}
		else if (gPathSplit[i].slice(0, "Select".length).toUpperCase() === "SELECT" )
		{
			if (DEBUGGING)
			{
				console.log("Select");
			}
			
			buttons[4].click();
		}
		else
		{
			if (DEBUGGING)
			{
				console.log("F: " + gPathSplit[i].toUpperCase());
			}
		}
	}
	
	paragraph.textContent = message;
	document.querySelector("body").appendChild(paragraph);
}

let gPath = "Down, Down, Select (Shift), Up, Up, Right, Right, Right, Right, Select (T), Down, Right, Right, Select (h), Up, Left, Left, Left, Left, Select (e), Down, Down, Down, Select ( ), Up, Up, Up, Select (q), Right, Right, Right, Right, Right, Right, Select (u), Right, Select (i), Down, Down, Left, Left, Left, Left, Select (c), Up, Right, Right, Right, Right, Right, Select (k), Down, Down, Select ( ), Up, Right, Right, Right, Right, Right, Select (b), Up, Up, Left, Left, Select (r), Right, Right, Right, Right, Right, Select (o), Left, Left, Left, Left, Left, Left, Left, Select (w), Down, Down, Right, Right, Right, Right, Right, Select (n), Down, Select ( ), Up, Up, Right, Right, Right, Right, Select (f), Up, Right, Right, Right, Right, Select (o), Down, Down, Left, Left, Left, Left, Left, Left, Select (x), Down, Select ( ), Up, Up, Right, Right, Right, Right, Right, Right, Right, Select (j), Up, Left, Select (u), Down, Down, Right, Select (m), Up, Up, Right, Right, Select (p), Down, Left, Left, Left, Left, Left, Left, Left, Select (s), Down, Down, Select ( ), Up, Up, Up, Right, Right, Right, Right, Right, Right, Right, Right, Select (o), Down, Down, Left, Left, Left, Left, Select (v), Up, Up, Left, Left, Select (e), Right, Select (r), Down, Down, Down, Select ( ), Up, Up, Up, Right, Right, Right, Right, Select (t), Down, Right, Right, Select (h), Up, Left, Left, Left, Left, Select (e), Down, Down, Down, Select ( ), Up, Up, Right, Right, Right, Right, Right, Right, Right, Right, Right, Select (l), Left, Left, Left, Left, Left, Left, Left, Left, Select (a), Down, Select (z), Up, Up, Right, Right, Right, Right, Select (y), Down, Down, Down, Select ( ), Up, Up, Right, Right, Right, Select (d), Up, Right, Right, Right, Right, Right, Select (o), Down, Left, Left, Left, Select (g), Down, Right, Right, Right, Right, Select (.), ";

// followPath(gPath);

async function visualizeMessage(msg)
{	
	for (let i = 0; i < msg.length; ++i)
	{
		if (DEBUGGING)
		{
			console.log("Searching for: " + msg.charAt(i));
		}
		
		if (msg.charAt(i) === " ")
		{
			await navigateToKey(4, 0);
		}
		else if (msg.charAt(i) === "\r\n")
		{
			await navigateToKey(2, 12);
		}
		else
		{
			for (let j = 0; j < keyboardKeys.length; ++j)
			{
				for (let k = 0; k < keyboardKeys[j].length; ++k)
				{
					if (keyboardKeys[j][k].includes(msg.charAt(i)))
					{
						if (DEBUGGING)
						{
							console.log("Key " + msg.charAt(i) + " found at (" + j + ", " + k + ")");
						}
						
						if (keyboardKeys[j][k][1] === msg.charAt(i))
						{
							if (kbSettings !== KeyboardSettings.CAPS_LOCK && kbSettings !== KeyboardSettings.SHIFT)
							{
								await navigateToKey(3, 0); // LEFT SHIFT
							}
							if (DEBUGGING)
							{
								console.log("Shift enabled?: " + (kbSettings === KeyboardSettings.SHIFT));
							}
							if (!(kbSettings === KeyboardSettings.SHIFT) && DEBUGGING)
								console.log("Returned false... actual setting is: " + kbSettings);
							
							await navigateToKey(j, k);
						}
						else
							await navigateToKey(j, k);
					}
				}
			}
		}
	}
}

async function navigateToKey(row, column, lower = true)
{
	if (currentRow !== row)
	{
		if (currentRow < row)
		{
			for (let i = currentRow; i < row; ++i)
			{
				if (DEBUGGING)
				{
					console.log("Down");
				}
				
				path += "Down, ";
				buttons[3].click();
				
				document.querySelector("div.path").textContent = "Down";
				await sleep(SLEEP_TIMER);
			}
		}
		else
		{
			for (let i = currentRow; i > row; --i)
			{
				if (DEBUGGING)
				{
					console.log("Down");
				}
				
				path += "Up, ";
				buttons[0].click();
				
				document.querySelector("div.path").textContent = "Up";
				await sleep(SLEEP_TIMER);
			}
		}
	}
	
	if (currentKeyIndex !== column)
	{
		if (currentKeyIndex < column)
		{
			for (let i = currentKeyIndex; i < column; ++i)
			{
				if (DEBUGGING)
				{
					console.log("Right");
				}
				
				path += "Right, ";
				buttons[2].click();
				
				document.querySelector("div.path").textContent = "Right";
				await sleep(SLEEP_TIMER);
			}
		}
		else
		{
			for (let i = currentKeyIndex; i > column; --i)
			{
				if (DEBUGGING)
				{
					console.log("Left");
				}
				
				path += "Left, ";
				buttons[1].click();
				
				document.querySelector("div.path").textContent = "Left";
				await sleep(SLEEP_TIMER);
			}
		}
	}
	
	if (currentRow === row && currentKeyIndex === column)
	{
		if (DEBUGGING)
		{
			console.log("Select.");
		}
		document.querySelector("div.path").textContent = "Select";
	}
	
	if (DEBUGGING)
	{
		console.log("Current row: " + currentRow);
		console.log("Current key: " + currentKeyIndex);
	}
	
	buttons[4].click();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}