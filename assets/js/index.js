const mutationObserver = new MutationObserver(entries => {
  console.log(entries)
})
const time_container = document.querySelector("[data-time_container]")
const display_monitor = document.querySelector("[data-display_monitor]")
const username = document.querySelector("[data-username]")
const free_up_space = document.querySelector("[data-free_up_space]")

function timeToSeconds(time) {
  var timeArray = time.split(':')
  var seconds = parseInt(timeArray[0]) * 3600 + parseInt(timeArray[1]) * 60
  return seconds
}

function secondsToHours(seconds) {
  var hours = seconds / 3600
  return hours;
}

function sumOverallHours() {
  return secondsToHours(Array.from(time_container.children).reduce((sum, component) => sum + parseFloat(component.getAttribute("data-seconds")), 0))
}

function displayHours(float) {
  display_monitor.textContent = `Overall Hours: ${parseFloat(float.toFixed(7))}`
}

function saveComponents() {
  const componentsData = []

  function timeStampTemplate(seconds, label, start_timestamp, end_timestamp) {
    const template = {
      "seconds": seconds,
      "label": label,
      "start_timestamp": start_timestamp,
      "end_timestamp": end_timestamp
    }
    return template
  }
  
  Array.from(time_container.children).forEach(component => {
    componentsData.push(timeStampTemplate(component.getAttribute("data-seconds"), component.getAttribute("data-label"), component.getAttribute("data-start_timestamp"), component.getAttribute("data-end_timestamp")))
  })

  localStorage.setItem(username.value.trim() || "username", JSON.stringify(componentsData))
}

function loadComponents() {
  let componentsData = localStorage.getItem(username.value.trim() || "username")
  if (!componentsData) return

  Array.from(JSON.parse(componentsData)).forEach(componentData => {
    time_container.append(timeComponent(componentData.seconds, componentData.label, componentData.start_timestamp, componentData.end_timestamp))
  })
}

function clearComponents() {
  Array.from(time_container.children).forEach(component => {
    component.remove()
  })
}

function clearStorage() {
  localStorage.clear()
}

function timeComponent(seconds, label, start_timestamp, end_timestamp) {
  const component = document.createElement("div")
  component.setAttribute("class", "time_component")
  component.setAttribute("data-time_component", "")
  component.setAttribute("data-seconds", seconds || "0")
  component.setAttribute("data-start_timestamp", start_timestamp || "0")
  component.setAttribute("data-end_timestamp", end_timestamp || "0")
  component.setAttribute("data-label", label || "")

  const start_property = document.createElement("input")
  start_property.type = "time"
  start_property.setAttribute("class", "start")
  start_property.setAttribute("data-start", "")
  start_property.value = start_timestamp || 0

  const end_property = document.createElement("input")
  end_property.type = "time"
  end_property.setAttribute("class", "end")
  end_property.setAttribute("data-end", "")
  end_property.value = end_timestamp || 0

  const destroy_property = document.createElement("div")
  destroy_property.setAttribute("class", "time_destroy")
  destroy_property.setAttribute("data-time_destroy", "")
  destroy_property.textContent = "remove"

  const label_property = document.createElement("input")
  label_property.setAttribute("class", "time_label")
  label_property.setAttribute("data-time_label", "")
  label_property.value = label || ""
  label_property.placeholder = `label`
  label_property.setAttribute("spellcheck", false)

  component.append(start_property)
  component.append(end_property)
  component.append(label_property)
  component.append(destroy_property)

  function setSeconds(float) {
    component.setAttribute("data-seconds", float)
  }
  function setLabel() {
    component.setAttribute("data-label", label_property.value)
  }
  function setStartTimeStamp() {
    component.setAttribute("data-start_timestamp", start_property.value)
  }
  function setEndTimeStamp() {
    component.setAttribute("data-end_timestamp", end_property.value)
  }

  function onChangeSeconds() {
    return timeToSeconds(end_property.value) - timeToSeconds(start_property.value)
  }

  start_property.addEventListener("change", () => {
    setStartTimeStamp(start_property.value)
    setSeconds(onChangeSeconds())
    displayHours(sumOverallHours())

    saveComponents()
  })
  end_property.addEventListener("change", () => {
    setEndTimeStamp()
    setSeconds(onChangeSeconds())
    displayHours(sumOverallHours())

    saveComponents()
  })

  label_property.addEventListener("keyup", () => {
    setLabel(label_property.value)
    
    saveComponents()
  })

  destroy_property.addEventListener("click", (e) => {
    if(!confirm(`Removing Component: ${e.target.parentElement.getAttribute("data-label")}`)) return

    component.remove()
    displayHours(sumOverallHours())

    saveComponents()
  })

  return component
}

free_up_space.addEventListener("click", () => {
  if(!confirm("Clear Every Usernames?")) return
  clearComponents()
  clearStorage()
})
username.addEventListener("keyup", () => {
  clearComponents()
  loadComponents()
  displayHours(sumOverallHours())
})


document.querySelector("[data-increment_component]").addEventListener("click", () => {
  time_container.append(timeComponent())

  saveComponents()
})

window.onload = () => {
  loadComponents()
  displayHours(sumOverallHours())
}


// mutationObserver.observe(time_container, {
//   childList: true,
//   attributes: true,
//   attributesOldValue: true
// })