import type {
    Task,
    Requirement,
    Project
} from "./types";

const projectForm = document.querySelector("#projectForm") as HTMLFormElement;
const projectName = document.querySelector("#projectName") as HTMLInputElement;
const projectDescription = document.querySelector("#projectDescription") as HTMLTextAreaElement;
const projectsList = document.querySelector("#projectsList") as HTMLDivElement;
const projectDetail = document.querySelector("#projectDetail") as HTMLDivElement;
const dashboard = document.querySelector("#dashboard") as HTMLDivElement;

let selectedProjectId:number | null = null;

let projects: Project[] = [];

//Obtiene los projectos guardados en LocalStorage
const savedProjects = localStorage.getItem("projects");

if (savedProjects !== null) {
    projects = JSON.parse(savedProjects) as Project[]
}
renderProjects()
renderDashboard()
//--Obtiene los projectos guardados en LocalStorage

function renderProjects() {
    projectsList.innerHTML = ""

    projects.forEach(function(project){
        const divElement = document.createElement("div")
        divElement.innerHTML = `<p>------------------------- <br>
        ${project.name}<br>
        ${project.description}<br>
        <button onclick="deleteProject(${project.id})">Eliminar</button> <br>
        <button onclick="selectProject(${project.id})">Ver Detalle</button> <br>
        <button onclick="editProject(${project.id})">Editar</button><br>
        -------------------------</p>`
        
        projectsList.appendChild(divElement)
    });
}

function toggleTaskStatus(projectId:number, requirementId:number, taskId:number){
   const projectAux = getProjectById(projectId)
    //Si projectAux esta vacio
   if (!projectAux){
        return;
   }

   
   const requirementAux = getRequirementById(projectAux,requirementId)
    //Si projectAux esta vacio
   if (!requirementAux){
        return;
   }

   
   const taskAux = getTaskById(requirementAux,taskId)
       //Si task esta vacio
   if (!taskAux){
        return;
   }

   switch(taskAux.status){
        case "pending":
            taskAux.status = "done"
            break
        case "done":
        taskAux.status = "pending"
        break
   }

    updateDetail()
  
}

function renderDashboard() {
    const totalProjects = projects.length;

    let totalRequirements = 0;
    let totalTasks = 0;
    let pendingTasks = 0;
    let doneTasks = 0;

    projects.forEach(function(project) {
        totalRequirements += project.requirements.length;

        project.requirements.forEach(function(requirement) {
            totalTasks += requirement.tasks.length;

            requirement.tasks.forEach(function(task) {
                if (task.status === "pending") {
                    pendingTasks++;
                }

                if (task.status === "done") {
                    doneTasks++;
                }
            });
        });
    });

    dashboard.innerHTML = `
        <p>Total proyectos: ${totalProjects}</p>
        <p>Total requerimientos: ${totalRequirements}</p>
        <p>Total tareas: ${totalTasks}</p>
        <p>Tareas pendientes: ${pendingTasks}</p>
        <p>Tareas completadas: ${doneTasks}</p>
    `;
}

function renderProjectDetail(){
    projectDetail.innerHTML = ""


    const projectAux = getSelectedProject()

    if(!projectAux){
        return
    }

    projectDetail.innerHTML = `
        <h3>${projectAux.name}</h3>
        <p>${projectAux.description}</p>

        <h4>Requerimientos</h4>

        <form id="requirementForm">
            <input 
                type="text" 
                id="requirementTitle" 
                placeholder="Nuevo requerimiento"
            >
            <button type="submit">Agregar requerimiento</button>
        </form>

        <ul>
            ${projectAux.requirements.map(function(requirement){
                return `
                    <li>
                        <strong>${requirement.title}</strong>
                        <button onclick="editRequirement(${requirement.id})">Editar</button>
                        <button onclick="deleteRequirement(${requirement.id})">Eliminar</button>

                        <div>
                            <input 
                                type="text" 
                                id="taskTitle-${requirement.id}" 
                                placeholder="Nueva tarea"
                            >

                            <button onclick="handleAddTask(${projectAux.id}, ${requirement.id})">
                                Agregar tarea
                            </button>
                        </div>

                        <ul>
                            ${requirement.tasks.map(function(task){
                                return `
                                    <li>
                                         ${task.status === "done" ? "✅" : "⬜"} ${task.title}
                                         <button onclick="toggleTaskStatus(${projectAux.id}, ${requirement.id}, ${task.id})"> Cambiar estado </button>
                                         <button onclick="editTask(${requirement.id}, ${task.id})">Editar</button>
                                         <button onclick="deleteTask(${requirement.id}, ${task.id})"> Eliminar </button>
                                    </li>
                                `
                            }).join("")}
                        </ul>
                    </li>
                `;
            }).join("")}
        </ul>
    `
    const requirementForm = document.querySelector("#requirementForm") as HTMLFormElement;
    const requirementTitle = document.querySelector("#requirementTitle") as HTMLInputElement;

    requirementForm.addEventListener("submit", function(event){
        event.preventDefault();

        if (requirementTitle.value.trim() === ""){
            return;
        }

        addRequirement(projectAux.id, requirementTitle.value.trim());

        updateDetail()
    });
}

function handleAddTask(projectId:number, requirementId:number){
    const taskTitle = document.querySelector(`#taskTitle-${requirementId}`) as HTMLInputElement;

    if (taskTitle.value.trim() === ""){
        return;
    }

    addTask(projectId, requirementId, taskTitle.value.trim());

    updateDetail()
}

function saveProjects(){
    localStorage.setItem("projects",JSON.stringify(projects))
}


function deleteProject(id:number){

    if (confirm("¿Estás seguro de eliminar este proyecto?")){
        projects = projects.filter((project) => project.id !== id)

        if (selectedProjectId === id) {
            selectedProjectId = null
            projectDetail.innerHTML = ""
        }

        updateApp()
    }

}

function editProject(id:number){
    
    const projectAux = getProjectById(id)
  
    //Si projectAux esta vacio
   if (!projectAux){
        return;
   }
   const newNombre = prompt("Ingrese el nombre")
   //Si newNombre esta vacio
   if (newNombre === null) {
        return
   }

   if (newNombre.trim() === ""){
    return
   }

    projectAux.name = newNombre

   const newDescripcion = prompt("Ingrese la descripción")
      //Si newDescripcion esta vacio
   if (newDescripcion === null){
        return
   }

    if (newDescripcion.trim() === ""){
        return
   }

   projectAux.description = newDescripcion

   updateApp()

   if (selectedProjectId === id) {
        renderProjectDetail()
    }
}

function editRequirement(reqId:number){
    
    const projectAux = getSelectedProject()

    //Si projectAux esta vacio
   if (!projectAux){
        return
   }

    const requirementAux =  getRequirementById(projectAux,reqId)
    //Si requirementAux esta vacio
   if (!requirementAux){
        return
   }

   const newTitle = prompt("Ingrese el titulo",requirementAux.title)
   if(newTitle === null){
    return
   }

   if(newTitle.trim() === ""){
    return
   }

   requirementAux.title = newTitle

   updateDetail()

}

function editTask(reqId:number,taskId:number){

    const projectAux = getSelectedProject()

    //Si projectAux esta vacio
   if (!projectAux){
        return
   }

   const requirementAux =  getRequirementById(projectAux,reqId)
    //Si requirementAux esta vacio
   if (!requirementAux){
        return
   }

   const taskAux = getTaskById(requirementAux,taskId)
    //Si taskAux esta vacio
   if (!taskAux){
        return
   }

   const newTitle = prompt("Ingrese el título",taskAux.title)

   if(newTitle === null){
    return
   }

   if(newTitle.trim() === ""){
    return
   }

   taskAux.title = newTitle.trim()

   updateDetail()
}


function deleteRequirement(reqId: number) {
    if (confirm("¿Estás seguro de eliminar este requerimiento?")) {

        const projectAux = getSelectedProject()

        if (!projectAux) {
            return;
        }

        projectAux.requirements = projectAux.requirements.filter(
            projectReq => projectReq.id !== reqId
        );

        updateDetail();
    }
}

function selectProject(id:number){
    console.log(`ID ${id}`)
    selectedProjectId = id
    renderProjectDetail();
}

function addRequirement(projectId:number, title:string){

   const projectAux = getProjectById(projectId);

    //Si projectAux esta vacio
   if (!projectAux){
        return;
   }

   const requirement: Requirement = {
    id:Date.now(),
    title:title,
    tasks:[]
   }

   projectAux.requirements.push(requirement)
   console.log(projects)
}

function addTask(projectId:number,requirementId:number,title:string){

   const projectAux = getProjectById(projectId)

    //Si projectAux esta vacio
   if (!projectAux){
        return;
   }
   
   const requirementAux = getRequirementById(projectAux,requirementId)
    //Si projectAux esta vacio
   if (!requirementAux){
        return;
   }

   const task:Task = {
    id:Date.now(),
    title:title,
    status:"pending"
   }

   requirementAux.tasks.push(task)

   console.log(projects)

}

function deleteTask(reqId:number,taskId:number){

    if (confirm("¿Estás seguro de eliminar esta tarea?")){

        const projectAux = getSelectedProject()

        //Si projectAux esta vacio
        if (!projectAux){
                return;
        }
        
        const requirementAux = getRequirementById(projectAux,reqId)
        //Si requirementAux esta vacio
        if (!requirementAux){
                return;
        }
         
        requirementAux.tasks = requirementAux.tasks.filter(task => task.id !== taskId)
        updateDetail()
    }
}

function updateApp() {
    saveProjects()
    renderProjects()
    renderDashboard()
}

function updateDetail() {
    saveProjects()
    renderProjectDetail()
    renderDashboard()
}

/*Funciones Helpers*/
function getProjectById(id: number): Project | undefined {
    return projects.find(project => project.id === id);
}

function getSelectedProject(): Project | undefined {
    if (selectedProjectId === null) {
        return undefined;
    }

    return getProjectById(selectedProjectId);
}

function getRequirementById(project: Project,requirementId: number): Requirement | undefined {
    return project.requirements.find(requirement => requirement.id === requirementId)
}

function getTaskById(requirement: Requirement,taskId: number): Task | undefined {
    return requirement.tasks.find(task => task.id === taskId);
}


projectForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if ((projectName.value.trim() === "") || (projectDescription.value.trim() ==="")){
        return
    }

    const project:Project = {
        id:Date.now(),
        name:projectName.value.trim(),
        description:projectDescription.value.trim(),
        requirements:[]
    }

    console.log(project)

    projects.push(project)
    updateApp()

    projectName.value = "";
    projectDescription.value = "";


});

