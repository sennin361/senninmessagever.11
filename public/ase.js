// AES暗号化／復号化ユーティリティ
const AES_KEY = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16文字の鍵
const AES_IV = CryptoJS.enc.Utf8.parse('6543210987654321');  // 16文字の初期化ベクトル

function encryptMessage(plainText) {
  const encrypted = CryptoJS.AES.encrypt(plainText, AES_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

function decryptMessage(cipherText) {
  const decrypted = CryptoJS.AES.decrypt(cipherText, AES_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
