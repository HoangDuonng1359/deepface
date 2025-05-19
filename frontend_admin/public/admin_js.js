let allStudents = [];  // chứa toàn bộ danh sách từ server
let allCourses = [];

function renderStudentRows(students) {
  const tbody = document.querySelector('#view-students tbody');
  tbody.innerHTML = '';
  students.forEach(s => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${s.student_id}</td>
      <td>${s.student_name}</td>
      <td class="action-column">
        <button class="icon-btn" onclick="editStudent('${s.student_id}')" title="Sửa">
            <i data-feather="edit-2"></i>
        </button>
        <button class="icon-btn icon-btn-danger" onclick="deleteStudent(this,'${s.student_id}')" title="Xóa">
            <i data-feather="trash-2"></i>
        </button>
      </td>`;
    row.addEventListener('click', e => {
      if (!e.target.closest('.action-column')) {
        showStudentDetailModal(s.student_id);
      }
    });
    tbody.appendChild(row);
    feather.replace();
  });
}


function filterStudents() {
  const idQ   = document.getElementById('class-search-id').value.trim().toLowerCase();
  const nameQ = document.getElementById('class-search-name').value.trim().toLowerCase();

  const filtered = allStudents.filter(s =>
    (!idQ   || s.student_id.toLowerCase().includes(idQ)) &&
    (!nameQ || s.student_name.toLowerCase().includes(nameQ))
  );

  if (filtered.length === 0) {
    showNoResultModal(); // Modal báo "Không tìm thấy sinh viên"
    return;
  }

  renderStudentRows(filtered);
}


function showPage(pageId, event = null) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    if (event) event.target.classList.add('active');if (event) {
    event.target.classList.add('active');
    } else {
    activateMenuItemByPageId(pageId);
    }


    if (pageId === 'view-classes') loadAllCourses();
    if (pageId === 'view-students') loadAllStudents();
    if (pageId === 'home') updateDashboard();
}

async function loadAllCourses() {
    try {
        const response = await fetch("http://backend:8000/api/courses");
        const json = await response.json();

        if (!json.success) {
            alert("Không thể tải danh sách lớp học.");
            return;
        }

        allCourses = json.data;
        renderCourseTable(allCourses);

    } catch (error) {
        console.error("Lỗi khi tải danh sách lớp học:", error);
        alert("Không thể kết nối tới máy chủ.");
    }
}


async function viewCourseDetail(event, courseId) {
    if (event) event.stopPropagation();

    try {
        const response = await fetch(`http://backend:8000/api/courses/${courseId}`);
        const json = await response.json();

        if (!json.success) {
            alert(json.message || "Không tìm thấy lớp học.");
            return;
        }

        const cls = json.data; // ✅ đúng;

        // ✅ Mở đúng modal
        document.getElementById('edit-class-modal').style.display = 'flex';

        // ✅ Gán input trong modal
        document.getElementById("edit-class-id").value = cls.course_id;
        document.getElementById("edit-class-name").value = cls.course_name;
        document.getElementById("edit-teacher-name").value = cls.teacher_name;

        // ✅ Render danh sách sinh viên
        const tableBody = document.getElementById('edit-class-student-body');
        tableBody.innerHTML = '';

        cls.students.forEach(student => {
            let studentId = '';
            let studentName = '';

            // Nếu là object đầy đủ
            if (typeof student === 'object' && student !== null) {
                studentId = student.student_id || student.studentId || '';
                studentName = student.student_name || student.studentName || '';
            }
            // Nếu chỉ là MSSV dạng chuỗi
            else if (typeof student === 'string') {
                studentId = student;
                studentName = '';  // không có tên
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${studentId}</td>
                <td>${studentName}</td>
                <td class="action-cell">
                    <button class="icon-btn icon-btn-danger" onclick="removeRow(this)" title="Xoá">
                        <i data-feather="trash-2"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });


        feather.replace();
    } catch (error) {
        console.error("Lỗi khi xem chi tiết lớp:", error);
        alert("Không thể kết nối tới máy chủ.");
    }
}


function closeClassDetail() {
    document.getElementById("class-detail-modal").style.display = "none";
}

async function showClassDetailModal(courseId) {
    try {
        const response = await fetch(`http://backend:8000/api/courses/${courseId}`);
        const json = await response.json();

        if (!json.success) {
            alert(json.message || "Không tìm thấy lớp học.");
            return;
        }

        const cls = json.data;

        // Gán thông tin lớp
        document.getElementById("detail-course-id").innerText = cls.course_id;
        document.getElementById("detail-course-name").innerText = cls.course_name;
        document.getElementById("detail-teacher-name").innerText = cls.teacher_name;
        document.getElementById("detail-num-student").innerText = Array.isArray(cls.students) ? cls.students.length : 0;

        // Danh sách sinh viên
        const tbody = document.getElementById("detail-student-list");
        tbody.innerHTML = '';
        cls.students.forEach(s => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${s.student_id}</td>
                <td>${s.student_name}</td>
            `;
            tbody.appendChild(row);
        });

        // Hiển thị modal
        document.getElementById("class-detail-modal").style.display = "flex";

    } catch (err) {
        console.error("Lỗi khi lấy chi tiết lớp:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}

window.addEventListener("click", function (event) {
    const modal = document.getElementById("class-detail-modal");
    if (event.target === modal) {
        closeClassDetail();
    }
});

function addStudentRow() {
    const tbody = document.getElementById('add-class-student-table');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td><input type="text" class="standard-input" placeholder="MSSV" /></td>
        <td></td>
        <td style="text-align: center;">
            <button class="icon-btn" onclick="confirmRow(this)" title="Lưu">
                <i data-feather="check"></i>
            </button>
            <button class="icon-btn icon-btn-danger" onclick="removeRow(this)" title="Xoá">
                <i data-feather="trash-2"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
    feather.replace();
}

function removeRow(button) {
    const row = button.closest('tr');
    if (row) row.remove();
}

function addStudentRowToEditClass() {
    const tbody = document.getElementById('edit-class-student-body');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td><input type="text" class="standard-input" placeholder="MSSV" /></td>
        <td></td>
        <td class="action-cell" style="display: flex; align-items: center; gap: 8px;">
            <button class="icon-btn" onclick="confirmRow(this)" title="Lưu">
                <i data-feather="check"></i>
            </button>
            <button class="icon-btn icon-btn-danger" onclick="removeRow(this)" title="Xoá">
                <i data-feather="trash-2"></i>
            </button>
        </td>
    `;

    tbody.appendChild(row);
    feather.replace();
}

async function confirmRow(button) {
    const row = button.closest('tr');
    const input = row.querySelector('input');
    const mssv = input.value.trim();

    if (!mssv) {
        alert("Vui lòng nhập MSSV!");
        return;
    }

    try {
        const res = await fetch(`http://backend:8000/api/students/${mssv}`);
        const result = await res.json();

        if (!result.success || !result.data) {
            alert("Không tìm thấy sinh viên với MSSV này.");
            return;
        }

        const name = result.data.student_name || '';

        row.innerHTML = `
            <td>${mssv}</td>
            <td>${name}</td>
            <td class="action-cell">
                <button class="icon-btn icon-btn-danger" onclick="removeRow(this)" title="Xoá">
                    <i data-feather="trash-2"></i>
                </button>
            </td>
        `;

        feather.replace();
    } catch (err) {
        console.error("Lỗi khi tìm sinh viên:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}

function editRow(button) {
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td');

    const mssv = cells[0].textContent.trim();
    const name = cells[1].textContent.trim();

    row.innerHTML = `
        <td><input type="text" class="standard-input" value="${mssv}" /></td>
        <td><input type="text" class="standard-input" value="${name}" /></td>
        <td class="action-cell">
            <button class="icon-btn" onclick="confirmRow(this)" title="Lưu">
                <i data-feather="check"></i>
            </button>
            <button class="icon-btn icon-btn-danger" onclick="removeRow(this)" title="Xoá">
                <i data-feather="trash-2"></i>
            </button>
        </td>
    `;
    feather.replace();  // để hiển thị lại icon
}


async function createNewClass() {
    const courseId = document.getElementById("course-id").value.trim();
    const courseName = document.getElementById("course-name").value.trim();
    const teacherName = document.getElementById("teacher-name").value.trim();

    if (!courseId || !courseName || !teacherName) {
        alert("Vui lòng nhập đầy đủ thông tin lớp học.");
        return;
    }

    const studentIds = [];
    const studentRows = document.querySelectorAll('#add-class-student-table tr');

    for (const row of studentRows) {
        const cell = row.querySelector('td:nth-child(1)');
        const input = cell.querySelector('input');
        const mssv = input ? input.value.trim() : cell.textContent.trim();

        if (mssv) {
            studentIds.push(mssv);
        }
    }

    if (studentIds.length === 0) {
        alert("Vui lòng nhập ít nhất 1 sinh viên.");
        return;
    }

    const payload = {
        course_id: courseId,
        course_name: courseName,
        teacher_name: teacherName,
        students: studentIds
    };

    try {
        const res = await fetch('http://backend:8000/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.success) {
            alert("✅ Lớp học đã được thêm.");
            closeAddClassModal();
            loadAllCourses();
        } else {
            alert("❌ " + (result.message || "Thêm thất bại."));
        }

    } catch (err) {
        console.error("Lỗi khi tạo lớp:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}



async function deleteCourse(button, courseId) {
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa lớp ${courseId}?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`http://backend:8000/api/courses/${courseId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            // Xoá dòng tương ứng khỏi bảng
            const row = button.closest('tr');
            if (row) row.remove();
            alert(result.message);
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Lỗi khi xóa lớp:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}

async function loadAllStudents() {
    try {
        const response = await fetch("http://backend:8000/api/students");
        const json = await response.json();

        if (!json.success) {
        alert("Lỗi khi tải sinh viên: " + json.message);
        return;
        }

        allStudents = json.data;
        renderStudentRows(json.data);
    } catch (err) {
        console.error("Lỗi khi tải danh sách sinh viên:", err);
        alert("Không thể tải dữ liệu sinh viên.");
    }
}



async function showStudentDetailModal(studentId) {
    try {
        const res = await fetch(`http://backend:8000/api/students/${studentId}`);
        const result = await res.json();

        // ✅ Kiểm tra kết quả từ backend
        if (!result.success || !result.data) {
            alert(result.message || "Không tìm thấy sinh viên.");
            return;
        }

        const student = result.data;

        // ✅ Gán dữ liệu vào modal
        document.getElementById("detail-student-id").innerText = student.student_id;
        document.getElementById("detail-student-name").innerText = student.student_name;

        const imageContainer = document.getElementById("student-images");
        imageContainer.innerHTML = '';

        if (Array.isArray(student.images)) {
            student.images.forEach(base64 => {
                const img = document.createElement("img");
                img.src = `data:image/*;base64,${base64}`; // ✅ Hỗ trợ png hoặc jpeg
                imageContainer.appendChild(img);
            });
        }

        // ✅ Hiện modal
        document.getElementById("student-detail-modal").style.display = "flex";

    } catch (err) {
        console.error("Lỗi khi tải chi tiết sinh viên:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}


function closeStudentDetail() {
    document.getElementById("student-detail-modal").style.display = "none";
}

window.addEventListener("click", function (event) {
    const modal = document.getElementById("student-detail-modal");
    if (event.target === modal) {
        closeStudentDetail();
    }
});

async function deleteStudent(button, studentId) {
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa sinh viên ${studentId}?`);
    if (!confirmDelete) return;

    try {
        const res = await fetch(`http://backend:8000/api/students/${studentId}`, {
            method: 'DELETE'
        });

        const result = await res.json();

        if (result.success) {
            const row = button.closest('tr');
            if (row) row.remove();
            alert(result.message || `✅ Đã xóa sinh viên ${studentId}`);
        } else {
            alert(result.message || `❌ Xóa thất bại`);
        }
    } catch (err) {
        console.error("Lỗi khi xóa sinh viên:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}

async function createStudentFromPage() {
    const mssvInput = document.querySelector('#add-student input[placeholder="Nhập mã số sinh viên"]');
    const nameInput = document.querySelector('#add-student input[placeholder="Nhập họ và tên sinh viên"]');
    const photoCards = document.querySelectorAll('#photo-upload-container .student-card img');

    const studentId = parseInt(mssvInput.value.trim(), 10);
    const studentName = nameInput.value.trim();

    if (isNaN(studentId) || !studentName) {
        alert("Vui lòng nhập đúng MSSV (số) và họ tên.");
        return;
    }

    if (photoCards.length === 0) {
        alert("Vui lòng tải lên ít nhất một ảnh nhận dạng.");
        return;
    }

    const images = Array.from(photoCards).map(img =>
        img.src.replace(/^data:image\/(png|jpeg);base64,/, '')
    );

    const payload = {
        student_id: studentId,       // ✅ đúng với backend
        student_name: studentName,
        images
    };

    console.log("📤 Payload gửi đi:", payload);

    try {
        const res = await fetch("http://backend:8000/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const text = await res.text(); // nhận toàn bộ phản hồi dưới dạng text
        console.log("📥 Phản hồi từ backend (raw):", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error("❌ Phản hồi không phải JSON hợp lệ:", text);
            alert("❌ Server trả về phản hồi không hợp lệ.");
            return;
        }

        // Xử lý lỗi 422: Unprocessable Entity
        if (res.status === 422) {
            console.warn("⚠️ Lỗi 422 từ FastAPI:", result);
            alert("❌ Dữ liệu gửi lên không hợp lệ (HTTP 422). Xem console để biết thêm.");
            return;
        }

        // Thành công
        if (result.success) {
            alert("✅ Sinh viên đã được thêm thành công.");
            mssvInput.value = "";
            nameInput.value = "";
            document.getElementById("photo-upload-container").innerHTML = `
                <div class="student-card add-card" onclick="triggerImageUpload()">
                    <span>+</span>
                </div>
            `;
            loadAllStudents();
        } else {
            alert("❌ " + (result.message || "Thêm thất bại."));
        }

    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}



async function saveEditedClass() {
    const courseId = document.getElementById("edit-class-id").value.trim();
    const courseName = document.getElementById("edit-class-name").value.trim();
    const teacherName = document.getElementById("edit-teacher-name").value.trim();

    if (!courseId || !courseName || !teacherName) {
        alert("Vui lòng nhập đầy đủ thông tin lớp học.");
        return;
    }

    const studentIds = [];
    const rows = document.querySelectorAll('#edit-class-student-body tr');

    for (const row of rows) {
        const firstCell = row.querySelector('td:nth-child(1)');
        const input = firstCell.querySelector('input');
        const mssv = input ? input.value.trim() : firstCell.textContent.trim();

        if (mssv && /^[0-9a-zA-Z]+$/.test(mssv)) {  // Đảm bảo MSSV hợp lệ
            studentIds.push(mssv);
        }
    }

    const payload = {
        course_name: courseName,
        teacher_name: teacherName,
        students: studentIds
    };

    console.log("📤 Payload sẽ gửi:", JSON.stringify(payload, null, 2));

    try {
        const res = await fetch(`http://backend:8000/api/courses/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const resultText = await res.text();
        console.log("📥 Phản hồi raw:", resultText);

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            alert("❌ Phản hồi không phải JSON.");
            return;
        }

        if (result.success) {
            alert("✅ Cập nhật lớp học thành công.");
            closeEditClassModal();
            loadAllCourses();
        } else {
            alert("❌ " + (result.message || "Cập nhật thất bại."));
        }
    } catch (err) {
        console.error("Lỗi khi cập nhật lớp học:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}


function triggerImageUpload() {
    document.getElementById('image-input').click();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        // ➤ Tự động chọn container phù hợp đang mở (edit hoặc add)
        const container =
            document.querySelector('#edit-student-modal[style*="display: flex"] #edit-photo-container') ||
            document.querySelector('#add-student-modal[style*="display: flex"] #add-photo-container') ||
            document.getElementById('photo-upload-container'); // fallback

        // Tạo thẻ ảnh mới
        const newCard = document.createElement('div');
        newCard.className = 'student-card';
        newCard.style.position = 'relative';

        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '8px';
        img.style.objectFit = 'cover';

        const removeBtn = document.createElement('button');
        removeBtn.innerText = '✕';
        removeBtn.className = 'remove-image-btn';
        removeBtn.onclick = function () {
            container.removeChild(newCard);
        };

        newCard.appendChild(img);
        newCard.appendChild(removeBtn);

        // Chèn vào trước thẻ "+" (nếu có)
        const addCard = container.querySelector('.add-card');
        container.insertBefore(newCard, addCard);

        // Reset file input để có thể chọn lại cùng file nếu muốn
        event.target.value = '';
    };

    reader.readAsDataURL(file);
}


async function editStudent(studentId) {
    try {
        const res = await fetch(`http://backend:8000/api/students/${studentId}`);
        const result = await res.json();
        if (!result.success || !result.data) {
            alert("Không tìm thấy sinh viên.");
            return;
        }
        const student = result.data;

        // Gán dữ liệu vào modal
    document.getElementById("edit-mssv").value = student.student_id;
    document.getElementById("edit-name").value = student.student_name;

        const container = document.getElementById("edit-photo-container");
        container.innerHTML = '';

        if (Array.isArray(student.images)) {
            student.images.forEach(base64 => {
                const card = document.createElement("div");
                card.className = 'student-card';
                card.style.position = 'relative';

                const img = document.createElement("img");
                img.src = `data:image/jpeg;base64,${base64}`;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.borderRadius = '8px';
                img.style.objectFit = 'cover';

                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image-btn';
                removeBtn.textContent = '✕';
                removeBtn.onclick = function () {
                    container.removeChild(card);
                };

                card.appendChild(img);
                card.appendChild(removeBtn);
                container.appendChild(card);
            });
        }

        // Thêm lại nút dấu +
        const addCard = document.createElement('div');
        addCard.className = 'student-card add-card';
        addCard.onclick = triggerImageUpload;
        addCard.innerHTML = '<span>+</span>';
        container.appendChild(addCard);

        // Hiện modal
        document.getElementById("edit-student-modal").style.display = "flex";

    } catch (err) {
        console.error("Lỗi khi sửa sinh viên:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}




function showNoResultModal() {
  document.getElementById('no-result-modal').style.display = 'flex';
}

function closeNoResultModal() {
  document.getElementById('no-result-modal').style.display = 'none';
}

function activateMenuItemByPageId(pageId) {
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active'); // Xóa toàn bộ trước

    const onclick = item.getAttribute('onclick');
    if (onclick && onclick.includes(`'${pageId}'`)) {
      item.classList.add('active');
    }
  });
}

async function saveStudentFromModal() {
    const studentId = document.getElementById("edit-mssv").value.trim();
    const studentName = document.getElementById("edit-name").value.trim();
    const photoCards = document.querySelectorAll('#edit-photo-container .student-card img');

    if (!studentId || !studentName) {
        alert("Vui lòng nhập đầy đủ MSSV và họ tên.");
        return;
    }

    if (photoCards.length === 0) {
        alert("Vui lòng thêm ít nhất một ảnh.");
        return;
    }

    const images = Array.from(photoCards).map(img =>
        img.src.replace(/^data:image\/(png|jpeg);base64,/, '')
    );

    const payload = {
        student_name: studentName,
        images: images
    };


    try {
        const res = await fetch(`http://backend:8000/api/students/${studentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.success) {
            alert("✅ Cập nhật sinh viên thành công.");
            closeEditStudentModal();
            loadAllStudents();
        } else {
            alert("❌ " + result.message);
        }
    } catch (err) {
        console.error("Lỗi khi cập nhật sinh viên:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}

function closeEditStudentModal() {
    document.getElementById("edit-student-modal").style.display = "none";
}

function openAddStudentModal() {
    // Reset form
    document.getElementById("add-mssv").value = '';
    document.getElementById("add-name").value = '';
    document.getElementById("add-photo-container").innerHTML = `
        <div class="student-card add-card" onclick="triggerImageUpload()">
            <span>+</span>
        </div>
    `;
    document.getElementById("add-student-modal").style.display = "flex";
}

function closeAddStudentModal() {
    document.getElementById("add-student-modal").style.display = "none";
}

async function saveNewStudent() {
    const studentId = document.getElementById("add-mssv").value.trim(); // 👈 Giữ kiểu string
    const studentName = document.getElementById("add-name").value.trim();
    const photoCards = document.querySelectorAll('#add-photo-container .student-card img');

    if (!studentId || !studentName) {
        alert("Vui lòng nhập đầy đủ MSSV và họ tên.");
        return;
    }

    if (photoCards.length === 0) {
        alert("Vui lòng tải lên ít nhất một ảnh nhận dạng.");
        return;
    }

    const images = Array.from(photoCards)
        .map(img => {
            const src = img.src || '';
            const match = src.match(/^data:image\/(?:png|jpeg);base64,(.+)$/);
            return match && typeof match[1] === 'string' ? match[1] : null;
        })
        .filter(x => typeof x === 'string' && x.length > 0);

    if (images.length === 0) {
        alert("Ảnh không hợp lệ hoặc không thể xử lý. Vui lòng thử lại.");
        return;
    }

    const payload = {
        student_id: studentId, // 👈 string hợp lệ
        student_name: studentName,
        images: images
    };

    console.log("🧾 Payload gửi đi:", JSON.stringify(payload, null, 2));

    try {
        const res = await fetch("http://backend:8000/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const resultText = await res.text();
        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.error("❌ Phản hồi không phải JSON:", resultText);
            alert("❌ Server trả về dữ liệu không hợp lệ.");
            return;
        }

        console.log("📥 Phản hồi từ backend:", result);

        if (result.success) {
            alert("✅ Sinh viên đã được thêm.");
            closeAddStudentModal();
            loadAllStudents();
        } else {
            const detailMsg = result.message || (result.detail ? JSON.stringify(result.detail) : "Thêm thất bại.");
            alert("❌ " + detailMsg);
        }

    } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
        alert("Không thể kết nối tới máy chủ.");
    }
}


function closeEditClassModal() {
  document.getElementById("edit-class-modal").style.display = "none";
}

function openAddClassModal() {
  document.getElementById("course-id").value = "";
  document.getElementById("course-name").value = "";
  document.getElementById("teacher-name").value = "";
  document.getElementById("add-class-student-table").innerHTML = "";
  document.getElementById("add-class-modal").style.display = "flex";
}

function closeAddClassModal() {
  document.getElementById("add-class-modal").style.display = "none";
}

function filterCourses() {
  const idQ = document.getElementById('search-course-id').value.trim().toLowerCase();
  const nameQ = document.getElementById('search-course-name').value.trim().toLowerCase();

    const filtered = allCourses.filter(c =>
        (!idQ || String(c.course_id).toLowerCase().includes(idQ)) &&
        (!nameQ || c.course_name.toLowerCase().includes(nameQ))
    );

  if (filtered.length === 0) {
    showNoCourseModal(); // ✅ hiện modal nếu không có kết quả
    return;
  }

  renderCourseTable(filtered);
}

function renderCourseTable(courses) {
    const tableBody = document.querySelector('#view-classes tbody');
    tableBody.innerHTML = '';

    courses.forEach(course => {
        // Sửa lỗi không đếm được số sinh viên nếu chỉ có mảng MSSV
        let numStudent = 0;
        if (Array.isArray(course.students)) {
            if (typeof course.students[0] === 'object' && course.students[0] !== null) {
                numStudent = course.students.length;  // dạng [{ student_id, student_name }]
            } else if (typeof course.students[0] === 'string') {
                numStudent = course.students.length;  // dạng ["123", "456"]
            }
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.course_id}</td>
            <td>${course.course_name}</td>
            <td>${course.teacher_name}</td>
            <td class="action-column">
                <button class="icon-btn" onclick="viewCourseDetail(event, '${course.course_id}')" title="Sửa">
                    <i data-feather="edit-2"></i>
                </button>
                <button class="icon-btn icon-btn-danger" onclick="deleteCourse(this, '${course.course_id}')" title="Xóa">
                    <i data-feather="trash-2"></i>
                </button>
            </td>
        `;

        row.addEventListener('click', function (e) {
            if (!e.target.closest('.action-column')) {
                showClassDetailModal(course.course_id);
            }
        });

        tableBody.appendChild(row);
    });

    feather.replace();
}



function showNoCourseModal() {
  document.getElementById('no-course-modal').style.display = 'flex';
}

function closeNoCourseModal() {
  document.getElementById('no-course-modal').style.display = 'none';
}

async function updateDashboard() {
    try {
        // Lấy tổng số sinh viên
        const resStudents = await fetch('http://backend:8000/api/students');
        const students = await resStudents.json();
        if (students.success) {
            document.getElementById('total-students').innerText = students.data.length; // ✅
        }

        // Lấy tổng số lớp học
        const resCourses = await fetch('http://backend:8000/api/courses');
        const courses = await resCourses.json();
        if (courses.success) {
            document.getElementById('total-courses').innerText = courses.data.length;
        }

    } catch (err) {
        console.error("Lỗi khi cập nhật dashboard:", err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    feather.replace(); // ✅ để icon hiển thị
    updateDashboard();
});