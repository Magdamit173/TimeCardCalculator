const mutationObserver = new MutationObserver(entries => {
  console.log(entries)
})
const time_container = document.querySelector("[data-time_container]")
const display_monitor = document.querySelector("[data-display_monitor]")
const username = document.querySelector("[data-username]")
const free_up_space = document.querySelector("[data-free_up_space]")
const popups = document.querySelector("[data-popups]")
let active_popup = null

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

function confirmPopUp(dialogue, cancelDialogue, confirmDialogue, ...callbackDialogue) {
  return (async () => {
    if (active_popup) return

    let condition = false

    const popups_wrapper = document.createElement("div")
    popups_wrapper.setAttribute("class", "popups_wrapper")
    popups_wrapper.setAttribute("data-popups_wrapper", "")

    const popup_label = document.createElement("div")
    popup_label.setAttribute("class", "popup_label")
    popup_label.setAttribute("data-popup_label", "")
    popup_label.textContent = dialogue || "<empty>"

    const popup_cancel = document.createElement("button")
    popup_cancel.setAttribute("class", "popup_cancel")
    popup_cancel.setAttribute("data-popup_cancel", "")
    popup_cancel.textContent = cancelDialogue || `Cancel`

    const popup_confirm = document.createElement("button")
    popup_confirm.setAttribute("class", "popup_confirm")
    popup_confirm.setAttribute("data-popup_confirm", "")
    popup_confirm.textContent = confirmDialogue || `Confirm`

    popups_wrapper.append(popup_label)
    popups_wrapper.append(popup_cancel)
    popups_wrapper.append(popup_confirm)

    popups.append(popups_wrapper)
    active_popup = popups_wrapper

    callbackDialogue.forEach((callback) => {
      const popup_misc = document.createElement("button")
      popup_misc.setAttribute("class", "popup_misc ")
      popup_misc.setAttribute("data-popup_misc", "")
      popup_misc.textContent = `Yes`

      popups_wrapper.append(popup_misc)

      popup_misc.addEventListener("click", () => {
        callback()
        popups_wrapper.remove()
      })
    })

    await new Promise(resolve => {
      popup_cancel.addEventListener("click", () => {
        active_popup = null
        condition = false
        popups_wrapper.remove()
        resolve()
      })

      popup_confirm.addEventListener("click", () => {
        active_popup = null
        condition = true
        popups_wrapper.remove()
        resolve()
      })
    })
    return condition
  })()
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

  destroy_property.addEventListener("click", async (e) => {
    if (!await confirmPopUp(`Removing Component: ${e.target.parentElement.getAttribute("data-label")}`)) return

    component.remove()
    displayHours(sumOverallHours())

    saveComponents()
  })

  return component
}

free_up_space.addEventListener("click", async () => {
  if (!await confirmPopUp("Clear Every Usernames?")) return

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

window.onload = async () => {
  loadComponents()
  displayHours(sumOverallHours())

  if (window.innerWidth < 768) {
    const userAcceptsUnsupported = await confirmPopUp("Desktop Supported Website, Do You Want To Continue?")
    if (!userAcceptsUnsupported) {
      history.back()
    }
  }
}

window.addEventListener("keyup", e => {
  if (e.key == "/" && document.activeElement == document.body) username.focus()
})


// mutationObserver.observe(time_container, {
//   childList: true,
//   attributes: true,
//   attributesOldValue: true
// })