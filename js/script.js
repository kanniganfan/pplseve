let personnelData = [];
let filteredData = [];
let currentIndex = 0; // 当前显示的索引
const chunkSize = 500; // 初次加载500条数据
const additionalChunkSize = 500; // 每次滚动加载500条数据

// 获取数据并进行分块加载
fetch('ppl/12w.txt')
    .then(response => response.text())
    .then(data => {
        personnelData = data.split('\n').map(entry => {
            const [name, id] = entry.split('----');
            const area = getAreaById(id.trim()) || '未知';
            const gender = matchGender(id.trim()) || '未知';
            return { name: name.trim(), id: id.trim(), area, gender };
        });
        filteredData = [...personnelData];  // 初始化过滤数据
        loadMoreData(chunkSize); // 初始加载500条数据
    })
    .catch(error => console.error('Error fetching the file:', error));

// 随机获取500条数据
function getRandomData(chunk) {
    const shuffled = [...filteredData].sort(() => 0.5 - Math.random()); // 随机打乱数据
    return shuffled.slice(0, chunk); // 返回前500条
}

// 分块加载数据
function loadMoreData(chunk) {
    const personnelList = document.getElementById('personnel-list');
    const nextData = getRandomData(chunk); // 获取随机的500条数据

    // 生成HTML内容并添加到列表
    nextData.forEach(person => {
        personnelList.innerHTML += `<p><a href="#" class="person-link" data-id="${person.id}">${person.name}</a> (地区: ${person.area})</p>`;
    });

    // 更新当前显示的索引
    currentIndex += chunk;
}

// 滚动事件监听器，用于检测用户是否滚动到底部
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 调试：查看当前滚动位置和文档高度
    console.log('Scroll position:', scrollPosition, 'Document height:', documentHeight);

    // 判断是否滚动到页面底部
    if (scrollPosition >= documentHeight - 100) { // 增加100px缓冲，防止过早触发
        console.log('Scrolled to bottom');
        loadMoreData(additionalChunkSize); // 滚动到底部加载更多500条数据
    }
});

// 筛选按钮点击事件监听器
document.getElementById('filterBtn').addEventListener('click', () => {
    const nameSearch = document.getElementById('nameSearch').value.trim().toLowerCase();
    const ageRange = document.getElementById('ageFilter').value;
    const gender = document.getElementById('genderFilter').value;
    const area = document.getElementById('areaFilter').value;

    // 清除上次筛选的结果
    currentIndex = 0;
    document.getElementById('personnel-list').innerHTML = "";

    // 根据筛选条件过滤数据
    filteredData = personnelData.filter(person => {
        const nameMatch = nameSearch ? person.name.toLowerCase().includes(nameSearch) : true;
        const ageMatch = ageRange && ageRange !== "未知" ? matchAge(person.id, ageRange) : true;
        const genderMatch = gender && gender !== "未知" ? person.gender === gender : true;
        const areaMatch = area && area !== "未知" ? person.area === area : true;
        return nameMatch && ageMatch && genderMatch && areaMatch;
    });

    // 如果筛选后没有数据，提示用户
    if (filteredData.length === 0) {
        showModal("没有符合筛选条件的人员！");
    } else {
        // 筛选后重新加载数据
        loadMoreData(chunkSize); // 筛选后重新加载500条数据
    }
});

// 人员点击事件监听器
document.getElementById('personnel-list').addEventListener('click', (event) => {
    if (event.target.classList.contains('person-link')) {
        const id = event.target.getAttribute('data-id');
        const person = filteredData.find(p => p.id === id);
        if (person) {
            document.getElementById('nameField').textContent = person.name;
            document.getElementById('idField').textContent = person.id;
            document.getElementById('genderField').textContent = person.gender;
            document.getElementById('areaField').textContent = person.area;
            document.getElementById('modal').style.display = 'block';

            document.getElementById('decodeBtn').onclick = function() {
                window.location.href = `1.html?id=${id}`;
            };
        }
        event.preventDefault();
    }
});

// 关闭弹出窗口
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

// 点击可复制内容进行复制
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('copyable')) {
        const text = event.target.textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert(`已复制: ${text}`);
        }).catch(err => console.error('复制失败', err));
    }
});

// 年龄匹配函数
function matchAge(id, range) {
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(id.slice(6, 10));
    const age = currentYear - birthYear;
    if (range === "18-25") return age >= 18 && age <= 25;
    if (range === "26-35") return age >= 26 && age <= 35;
    if (range === "36-45") return age >= 36 && age <= 45;
    if (range === "46-55") return age >= 46 && age <= 55;
    if (range === "56-65") return age >= 56 && age <= 65;
    if (range === "66+") return age >= 66;
    return true;
}

// 性别匹配函数
function matchGender(id) {
    const genderChar = id.charAt(16);
    return genderChar % 2 === 0 ? '女' : '男';
}

// 显示模态框函数
function showModal(message) {
    document.getElementById('modalContent').textContent = message;
    document.getElementById('modal').style.display = 'block';
}

// 地区匹配函数
function getAreaById(id) {
    const provinceCodes = {
        '11': '北京', '12': '天津', '13': '河北', '14': '山西', '15': '内蒙古', '21': '辽宁', '22': '吉林', '23': '黑龙江',
        '31': '上海', '32': '江苏', '33': '浙江', '34': '安徽', '35': '福建', '36': '江西', '37': '山东', '41': '河南',
        '42': '湖北', '43': '湖南', '44': '广东', '45': '广西', '46': '海南', '50': '重庆', '51': '四川', '52': '贵州',
        '53': '云南', '54': '西藏', '61': '陕西', '62': '甘肃', '63': '青海', '64': '宁夏', '65': '新疆'
    };
    return provinceCodes[id.slice(0, 2)] || '未知';
}

// 刷新按钮点击事件监听器
document.getElementById("refreshBtn").addEventListener("click", function() {
    location.reload(); // 刷新页面
});
