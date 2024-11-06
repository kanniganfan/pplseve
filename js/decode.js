const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
document.getElementById('decodedId').textContent = id;

function decodeId(id) {
    if (!id) return "无效的号码";
    const birthYear = id.slice(6, 10);
    const birthMonth = id.slice(10, 12);
    const birthDay = id.slice(12, 14);
    const gender = (parseInt(id.charAt(16)) % 2 === 0) ? '女' : '男';
    const area = getAreaById(id.slice(0, 2));
    return `出生日期: ${birthYear}年${birthMonth}月${birthDay}日, 性别: ${gender}, 地区: ${area}`;
}

function getAreaById(code) {
    const provinceCodes = {
        '11': '北京', '12': '天津', '13': '河北', '14': '山西', '15': '内蒙古', '21': '辽宁', '22': '吉林', '23': '黑龙江',
        '31': '上海', '32': '江苏', '33': '浙江', '34': '安徽', '35': '福建', '36': '江西', '37': '山东', '41': '河南',
        '42': '湖北', '43': '湖南', '44': '广东', '45': '广西', '46': '海南', '50': '重庆', '51': '四川', '52': '贵州',
        '53': '云南', '54': '西藏', '61': '陕西', '62': '甘肃', '63': '青海', '64': '宁夏', '65': '新疆'
    };
    return provinceCodes[code] || '未知地区';
}

document.getElementById('decodeResult').textContent = decodeId(id);