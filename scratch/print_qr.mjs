import qrcode from 'qrcode-terminal';

const url = 'https://expo.dev/accounts/silv3rvip/projects/crtani-filmovi-app/builds/78e262fb-1989-4f2d-927f-ab5494a1fa5c';
qrcode.generate(url, { small: true }, (qr) => {
  console.log(qr);
});
