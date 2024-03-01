// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
  let id = nextId;
  nextId++;
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return id;
}


// Todo: create a function to create a task card
function createTaskCard(task) {

  //let backgroundColor = task.status === 'done' ? 'white' : getColor(task.dueDate);
  let formattedDueDate = dayjs(task.dueDate).format("MM/DD/YYYY"); // Format the due date

  let backgroundColor = getColor(task.dueDate);
  //let cardHeaderBackgroundColor = task.status === 'done' ? 'white' : backgroundColor;

  let cardHTML = `
  <div class="task-card" data-task-id="${task.id}" style="background-color: ${backgroundColor};">
      <div class="card-header">${task.name}</div>
      <div class="card-content">
          <p><strong> ${task.description}</strong></p>
          <p><strong> ${formattedDueDate}</strong></p>

      </div>
      <button class="btn btn-danger delete-task">Delete</button>
    </div>`;


  // Append the generated markup to the appropriate lane
  let lane = $("#" + task.status);
  console.log(lane);
  lane.append(cardHTML);

   // Set background color based on due date
   let card = $(".task-card[data-task-id='" + task.id + "']");
   card.find(".card-header").css("background-color", backgroundColor);
   if (task.status === 'done') {
    card.css("background-color", "white");
    card.find(".card-header").css("background-color", "white");
  }
}


// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  // Clear existing cards
  $(".lane ").empty();

  // Iterate over the taskList and create task cards
  taskList.forEach((task) => createTaskCard(task));
  taskList.map((task) => {
    console.log(task);
  });
  // Make the task cards draggable using jQuery UI
  //   $(".task-card").draggable({
  //     revert: "invalid",
  //     cursor: "grab",
  //   });
  $(".task-card").draggable({
    revert: "invalid",
    cursor: "grab",
    start: function (event, ui) {
      $(this).css("z-index", 1000); // Temporarily increase z-index while dragging
    },
    stop: function (event, ui) {
      $(this).css("z-index", ""); // Reset z-index after dragging
    },
  });
}



// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  // Extract task details from the form
  let taskName = $("#taskName").val().trim();
  let dueDate = $("#dueDate").val();
  let description = $("#description").val().trim();

  // Determine the color based on due date
  let color = getColor(dueDate);

  // Create a new task object
  let task = {
    id: generateTaskId(),
    name: taskName,
    dueDate: dueDate,
    description: description,
    status: "to-do", // Initial status
    color: color // Store the color in the task object

  };

  // Add the new task to the task list
  taskList.push(task);

  // Update localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  //   // Re-render the task list
  renderTaskList();

  // Close the modal
  $("#formModal").modal("hide");

  // Clear form fields
  $("#taskName").val("");
  $("#dueDate").val("");
  $("#description").val("");

  console.log("Task added:", task);
  console.log("Updated task list:", taskList);
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  let taskId = $(this).closest(".task-card").data("task-id");
  // Remove the task from the task list
  taskList = taskList.filter((task) => task.id !== taskId);
  // Update localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));
  // Re-render the task list
  renderTaskList();
  window.location.reload();
}

// Todo: create a function to handle dropping a task into a new status lane


function handleDrop(event, ui) {
  let taskId = ui.draggable.data("task-id");
  let newStatus = $(this).attr("id"); // Assuming this is the lane's ID corresponding to the task status

  // Update the status of the task in the taskList
  let taskIndex = taskList.findIndex((task) => task.id == taskId);
  if (taskIndex !== -1) {
    taskList[taskIndex].status = newStatus;

    // Directly append the draggable (task card) to this lane's specific drop target
    // Adjust the selector to match your HTML structure
    ui.draggable.detach().css({ top: 0, left: 0 }).appendTo(this);

    // Change background color if the task is moved to the 'done' lane
    if (newStatus === "done") {
      ui.draggable.css("background-color", "white"); // Change to white for done tasks
      ui.draggable.find(".card-header").css("background-color", "white"); // Set card header background to white

    } else {
      ui.draggable.css(
        "background-color",
        getColor(taskList[taskIndex].dueDate)
      );

      // Reset card header background to default color
      ui.draggable.find(".card-header").css(
        "background-color",
        getColor(taskList[taskIndex].dueDate)
      );
    }
    
    // Update localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));
  } else {
    console.error("Task not found");
  }
}

// Todo: function to get color based on due date
function getColor(dueDate) {
  let now = dayjs();
  let deadline = dayjs(dueDate);
  let daysUntilDeadline = deadline.diff(now, "day");

  if (daysUntilDeadline < 0) {
    return "red"; // overdue
  } else if (daysUntilDeadline <= 2) {
    return "yellow"; // nearing deadline
  } else {
    return "white"; // default
  }
}


// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // Render the task list when the page loads
  renderTaskList();
  console.log("task rendered");

  // Add event listener for modal form submission
  $("#addTaskForm").submit(handleAddTask);

  // Add event listener for task card deletions
  $(document).on("click", ".delete-task", handleDeleteTask);

  // Make lanes droppable using jQuery UI
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop,
  });

// Initialize date picker with desired date format
$("#dueDate").datepicker({
  dateFormat: "mm/dd/yy",
  changeMonth: true,
  changeYear: true,
});


});

