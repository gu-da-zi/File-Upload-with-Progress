// 获取 DOM 元素
const fileBrowseButton = document.querySelector(".file-browse-button")  // 文件浏览按钮
const fileBrowseInput = document.querySelector(".file-browse-input")  // 文件输入框
const fileUploadBox = document.querySelector(".file-upload-box")  // 文件上传容器
const fileList = document.querySelector(".file-list")  // 文件列表容器
const fileCompletedStatus = document.querySelector(".file-completer-status")  // 文件上传完成状态

let totalFiles = 0  // 总文件数
let completedFiles = 0  // 已完成上传的文件数

// 创建文件项的 HTML
const createFileItemHTML = (file, uniqueIdentifier) => {
  const { name, size } = file
  const extension = name.split(".").pop()

  // 返回文件项的 HTML
  return `
    <li class="file-item" id="file-item-${uniqueIdentifier}">
      <div class="file-extension">${extension}</div>
      <div class="file-content-wrapper">
        <div class="file-content">
          <div class="file-details">
            <h5 class="file-name">${name}</h5>
            <div class="file-info">
              <small class="file-size">4 MB / ${size}</small>
              <small class="file-divider">•</small>
              <small class="file-status">Uploading...</small>
            </div>
          </div>
          <button class="cancel-button">
            <i class="bx bx-x"></i>
          </button>
        </div>
        <div class="file-progress-bar">
          <div class="file-progress"></div>
        </div>
      </div>
    </li>
  `
}

// 处理文件上传
const handleFileUploading = (file, uniqueIdentifier) => {
  const xhr = new XMLHttpRequest()
  const formData = new FormData()
  formData.append("file", file)

  // 监听上传进度事件
  xhr.upload.addEventListener("progress", (e) => {
    const fileProgress = document.querySelector(`#file-item-${uniqueIdentifier} .file-progress`)
    const fileSize = document.querySelector(`#file-item-${uniqueIdentifier} .file-size`)

    const formattedFileSize = file.size >= 1024 * 1024 ? `${(e.loaded / (1024 * 1024)).toFixed(2)} MB / ${(e.total / (1024 * 1024)).toFixed(2)} MB` : `${(e.loaded / 1024).toFixed(2)} KB / ${(e.total / 1024).toFixed(2)} KB`
    const progress = Math.round((e.loaded / e.total) * 100)

    // 更新文件上传进度和文件大小显示
    fileProgress.style.width = `${progress}%`
    fileSize.innerText = formattedFileSize
  })

  // 发送文件上传请求
  xhr.open("POST", "api.php", true)
  xhr.send(formData)

  return xhr
}

// 处理选中的文件
const handleSelectedFiles = ([...files]) => {
  if (files.length === 0) return
  totalFiles += files.length
  // 遍历选中的文件
  files.forEach((file, index) => {
    const uniqueIdentifier = Date.now() + index

    // 创建文件项的 HTML
    const fileItemHTML = createFileItemHTML(file, uniqueIdentifier)

    // 将文件项添加到文件列表中
    fileList.insertAdjacentHTML("afterbegin", fileItemHTML)

    const currentFileItem = document.querySelector(`#file-item-${uniqueIdentifier}`)
    const cancelFileUploadButton = currentFileItem.querySelector(".cancel-button")

    // 处理文件上传
    const xhr = handleFileUploading(file, uniqueIdentifier)

    xhr.addEventListener("readystatechange", () => {
      // 当 readyState 变为 DONE（4），并且状态码为 200 时表示请求已完成
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        completedFiles++
        currentFileItem.querySelector(".file-status").innerText = "Completed"
        currentFileItem.querySelector(".file-status").style.color = "#00b125"
        cancelFileUploadButton.remove()
        fileCompletedStatus.innerText = `${completedFiles} / ${totalFiles} files completed`
      }
    })

    cancelFileUploadButton.addEventListener("click", () => {
      // 中止文件上传请求
      xhr.abort()
      currentFileItem.querySelector(".file-status").innerText = "Cancelled"
      currentFileItem.querySelector(".file-status").style.color = "#e3413f"
      cancelFileUploadButton.remove()
    })

    xhr.addEventListener("error", () => {
      // 当文件上传过程中发生错误时弹出警告提示
      alert("An error occurred during the file upload!")
    })
  })
  fileCompletedStatus.innerText = `${completedFiles} / ${totalFiles} files completed`
}

// 处理拖放事件
fileUploadBox.addEventListener("drop", (e) => {
  e.preventDefault()

  // 处理选中的文件
  handleSelectedFiles(e.dataTransfer.files)

  fileUploadBox.classList.remove("active")
  fileUploadBox.querySelector(".file-instruction").innerText = "Drag files here or"
})

fileUploadBox.addEventListener("dragover", (e) => {
  e.preventDefault()
  fileUploadBox.classList.add("active")
  fileUploadBox.querySelector(".file-instruction").innerText = "Release to upload or"
})

fileUploadBox.addEventListener("dragleave", (e) => {
  e.preventDefault()
  fileUploadBox.classList.remove("active")
  fileUploadBox.querySelector(".file-instruction").innerText = "Drag files here or"
})

// 处理文件输入框的变化事件
fileBrowseInput.addEventListener("change", (e) => handleSelectedFiles(e.target.files))

// 处理文件浏览按钮的点击事件
fileBrowseButton.addEventListener("click", () => fileBrowseInput.click())