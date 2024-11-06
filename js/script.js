let personnelData = [];

fetch('ppl/12w.txt')
    .then(response => response.text())
    .then(data => {
        personnelData = data.split('\n').map(entry => {
            const [name, id] = entry.split('----');
            const area = getAreaById(id.trim());
            const gender = matchGender(id.trim());
            return { name: name.trim(), id: id.trim(), area, gender };
        });
        displayData(personnelData);
    })
    .catch(error => console.error('Error fetching the file:', error));

function displayData(data) {
    const personnelList = document.getElementById('personnel-list');
    personnelList.innerHTML = data.map(person => {
        return `<p><a href="#" class="person-link" data-id="${person.id}">${person.name}</a> (地区: ${person.area})</p>`;
    }).join('');
}

document.getElementById('filterBtn').addEventListener('click', () => {
    const nameSearch = document.getElementById('nameSearch').value.trim().toLowerCase();
    const ageRange = document.getElementById('ageFilter').value;
    const gender = document.getElementById('genderFilter').value;
    const area = document.getElementById('areaFilter').value;

    if (!nameSearch && !ageRange && !gender && !area) {
        showModal("请输入名字或选择至少一个筛选条件进行筛选！");
        return;
    }

    let filteredData = personnelData.filter(person => {
        const nameMatch = nameSearch ? person.name.toLowerCase().includes(nameSearch) : true;
        const ageMatch = ageRange ? matchAge(person.id, ageRange) : true;
        const genderMatch = gender ? person.gender === gender : true;
        const areaMatch = area ? person.area === area : true;
        return nameMatch && ageMatch && genderMatch && areaMatch;
    });

    displayData(filteredData);
});

document.getElementById('personnel-list').addEventListener('click', (event) => {
    if (event.target.classList.contains('person-link')) {
        const id = event.target.getAttribute('data-id');
        const person = personnelData.find(p => p.id === id);
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

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('copyable')) {
        const text = event.target.textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert(`已复制: ${text}`);
        }).catch(err => console.error('复制失败', err));
    }
});

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

function matchGender(id) {
    const genderChar = id.charAt(16);
    return genderChar % 2 === 0 ? '女' : '男';
}

function showModal(message) {
    document.getElementById('modalContent').textContent = message;
    document.getElementById('modal').style.display = 'block';
}

function getAreaById(id) {
    const provinceCodes = {
        '11': '北京', '12': '天津', '13': '河北', '14': '山西', '15': '内蒙古', '21': '辽宁', '22': '吉林', '23': '黑龙江',
        '31': '上海', '32': '江苏', '33': '浙江', '34': '安徽', '35': '福建', '36': '江西', '37': '山东', '41': '河南',
        '42': '湖北', '43': '湖南', '44': '广东', '45': '广西', '46': '海南', '50': '重庆', '51': '四川', '52': '贵州',
        '53': '云南', '54': '西藏', '61': '陕西', '62': '甘肃', '63': '青海', '64': '宁夏', '65': '新疆'
    };
    return provinceCodes[id.slice(0, 2)] || '未知';
}