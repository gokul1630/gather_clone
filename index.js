const form = document.querySelector(".userForm")
const userInput = document.querySelector(".userInput")

document.onload=()=>{
	const user = localStorage.getItem('user')
if (user) {
	window.location.href='town.html'
} else {
	window.location.href='index.html'
}

}

form.addEventListener("submit",(event)=>{
	
	event.preventDefault()
	const uuid = generateUUID();
	window.localStorage.setItem("user",JSON.stringify({user:userInput.value, userId: uuid}))
	
	window.location.href='town.html'
})

function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random() * 16 | 0,
		  v = c === 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
	});
  }
