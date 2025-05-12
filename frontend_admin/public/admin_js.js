function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and highlight the clicked menu item
    event.target.classList.add('active');
}

async function fetchAndRenderClasses() {
    try {
        const response = await fetch('http://localhost:3000/classes'); // <-- Đã đổi sang localhost
        if (!response.ok) throw new Error('Lỗi khi gọi API');

        const data = await response.json();
        const tableBody = document.querySelector('#view-classes tbody');

        // Xóa dữ liệu cũ
        tableBody.innerHTML = '';

        // Duyệt và hiển thị dữ liệu lớp học
        data.forEach(cls => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cls.maLop}</td>
                <td>${cls.tenMon}</td>
                <td>${cls.giangVien}</td>
                <td>${cls.soSinhVien}</td>
                <td class="action-column">
                    <button class="btn btn-sm" onclick="viewClassDetails('${cls.courseId}')">Sửa</button>
                    <button class="btn btn-sm btn-danger">Xóa</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu lớp học:', error);
    }
}

async function viewClassDetails(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/courses/${courseId}`);
        if (!response.ok) throw new Error('Không thể lấy dữ liệu lớp học');

        const data = await response.json();

        // Gán dữ liệu vào form
        document.querySelector('#edit-class input[type="text"]:nth-child(1)').value = data.courseId;
        document.querySelector('#edit-class input[type="text"]:nth-child(2)').value = data.courseName;
        document.querySelector('#edit-class input[type="text"]:nth-child(3)').value = data.teacherName;

        // Cập nhật bảng danh sách sinh viên
        const tbody = document.querySelector('#edit-class table tbody');
        tbody.innerHTML = '';

        data.students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.studentId}</td>
                <td>${student.studentName}</td>
                <td>--/--</td>
            `;
            tbody.appendChild(row);
        });

        showPage('edit-class');
    } catch (error) {
        console.error('Lỗi khi lấy thông tin lớp học:', error);
    }
}

// Gửi yêu cầu tạo lớp học mới
async function createNewClass() {
    const maLop = document.querySelector('#add-class input[placeholder="Nhập mã lớp học"]').value.trim();
    const tenMon = document.querySelector('#add-class input[placeholder="Nhập tên môn học"]').value.trim();
    const giangVien = document.querySelector('#add-class input[placeholder="Nhập tên giảng viên"]').value.trim();

    if (!maLop || !tenMon || !giangVien) {
        alert("Vui lòng điền đầy đủ thông tin lớp học.");
        return;
    }

    const newClass = {
        courseId: maLop,
        courseName: tenMon,
        teacherName: giangVien
    };

    try {
        const response = await fetch('http://localhost:3000/classes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newClass)
        });

        if (!response.ok) throw new Error('Tạo lớp học thất bại');

        alert("Đã tạo lớp học thành công!");
        // Xóa form sau khi thêm
        document.querySelectorAll('#add-class input').forEach(input => input.value = '');
        // Chuyển về trang xem lớp học và tải lại danh sách
        showPage('view-classes');
        fetchAndRenderClasses();

    } catch (error) {
        console.error('Lỗi khi tạo lớp học:', error);
        alert("Đã xảy ra lỗi khi tạo lớp học.");
    }
}



