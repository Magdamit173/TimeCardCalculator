const mutationObserver = new MutationObserver(entries => {
  console.log(entries)
})
const time_container = document.querySelector("[data-time_container]")
const display_monitor = document.querySelector("[data-display_monitor]")

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
  display_monitor.textContent = `"Hours: ${float}"`
}


function timeComponent() {
  const component = document.createElement("div")
  component.setAttribute("class","time_component")
  component.setAttribute("data-time_component","")
  component.setAttribute("data-seconds","0")

  const start_property = document.createElement("input")
  start_property.type = "time"
  start_property.setAttribute("class","start")
  start_property.setAttribute("data-start","")

  const end_property = document.createElement("input")
  end_property.type = "time"
  end_property.setAttribute("class","end")
  end_property.setAttribute("data-end","")

  const destroy_property = document.createElement("div")
  destroy_property.setAttribute("class","time_destroy")
  destroy_property.setAttribute("data-time_destroy","")
  destroy_property.textContent = "-"

  component.append(start_property)
  component.append(end_property)
  component.append(destroy_property)

  function setSeconds(float) {
    component.setAttribute("data-seconds", float)
  }
  function onChangeSeconds() {
    return timeToSeconds(end_property.value) -  timeToSeconds(start_property.value)
  }


  start_property.addEventListener("change",() => {
    setSeconds(onChangeSeconds())
    displayHours(sumOverallHours())
  })
  end_property.addEventListener("change",() => {
    setSeconds(onChangeSeconds())
    displayHours(sumOverallHours())
  })

  destroy_property.addEventListener("click", () => {
    component.remove()
    displayHours(sumOverallHours())
  })

  return component
}

document.querySelector("[data-increment_component]").addEventListener("click", () => {
  const time_container = document.querySelector("[data-time_container]")
  time_container.append(timeComponent())
})


// mutationObserver.observe(time_container, {
//   childList: true,
//   attributes: true,
//   attributesOldValue: true
// })