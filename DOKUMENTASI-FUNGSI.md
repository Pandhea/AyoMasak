# Dokumentasi Fungsi AyoMasak!

Dokumen ini menjelaskan struktur HTML, tanggung jawab stylesheet, dan fungsi/event JavaScript pada aplikasi saat ini.

## Struktur proyek

| File                                                                               | Tanggung jawab                                                                                                                                                |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [index.html](./index.html)                                                         | Beranda peta, progres, buku stempel, panel destinasi/pengaturan/daftar masakan, dan mini-game memasak lama yang masih tertanam di halaman.                    |
| [ayomasak-dapur.html](./ayomasak-dapur.html)                                       | Dapur utama: bahan, drag-and-drop ke wajan, validasi resep, cerita hidangan, dan hadiah stempel.                                                              |
| [ayomasak-destinasi.html](./ayomasak-destinasi.html)                               | Menampilkan tiga resep dari kota katalog yang dipilih; setiap kartu membuka resep yang dipilih. Destinasi nonkatalog mempertahankan resep tunggal sebelumnya. |
| [ayomasak-index-masakan.html](./ayomasak-index-masakan.html)                       | Daftar resep yang dapat dibuka dari beranda.                                                                                                                  |
| [ayomasak-pengaturan.html](./ayomasak-pengaturan.html)                             | Tampilan pengaturan yang dibuka dalam panel tengah.                                                                                                           |
| [style.css](./style.css)                                                           | Semua CSS yang dipakai halaman. Aturan aplikasi dibatasi dengan kelas `body` masing-masing halaman.                                                           |
| [recipe-catalog.js](./recipe-catalog.js)                                           | Data bersama enam kota, 18 resep, bahan, cerita, serta jalur gambar dan stempel.                                                                              |
| [audio.js](./audio.js)                                                             | Mesin musik latar sintetis, efek suara, dan penyimpanan volume musik/efek; dimuat oleh semua halaman aplikasi.                                                |
| [loading-screen.js](./loading-screen.js)                                           | Menutup layar loading setelah gambar dan font halaman siap; tidak menampilkannya pada panel iframe.                                                         |
| [script.js](./script.js)                                                           | Menambahkan kelas `concept-ready` setelah DOM siap. File ini saat ini tidak ditautkan oleh halaman HTML.                                                      |
| `assets/logo/logolomba.jpg`                                                        | Logo sumber asli; dipertahankan tanpa perubahan.                                                                                                             |
| `assets/logo/ayomasak-logo.svg` dan `assets/logo/ayomasak-logo-clear.png`           | Logo hasil crop transparan dan penajaman untuk layar loading; SVG mandiri menyematkan raster WebP transparan agar detail ilustrasi 3D tetap terjaga.        |
| `assets/Jawa/Panduan Nama Makanan Utama.png`                                       | Sumber visual 18 makanan dari enam daerah di Jawa; file asli tidak diubah.                                                                                    |
| `assets/Jawa/{Banten,Jakarta,Bandung,Semarang,Yogyakarta,Surabaya}/`               | 18 PNG hidangan transparan yang dicrop dari ilustrasi resolusi tinggi tertanam pada SVG provinsi, tanpa label; dipakai di indeks masakan dan backstory.       |
| `assets/Stample/stample.jpeg`                                                      | Lembar sumber enam stempel terbaru; tiap stempel dipisah menjadi PNG transparan berdasarkan nama kota yang tercetak.                                          |
| `assets/Stample/stempel-{banten,jakarta,bandung,semarang,yogyakarta,surabaya}.png` | Gambar hadiah dan koleksi buku stempel; pemetaan kota mengikuti label pada stempel, tidak urutan gambar di lembar sumber.                                     |
| `assets/gambar-masakan/`                                                           | Folder untuk menyimpan gambar resep lain yang akan ditambahkan berikutnya.                                                                                    |

> Mayoritas JavaScript masih berada di dalam tag `<script>` tiap file HTML. `style.css` adalah stylesheet bersama, bukan JavaScript bersama.

Layar loading bersama memakai logo aplikasi, warna hangat, dan bingkai bergaya permainan. Indikator bergerak selama gambar/font disiapkan, lalu layar memudar setelah siap; halaman yang berjalan di iframe tidak menampilkan layar loading kedua.

## Alur aplikasi

1. `index.html` menampilkan peta dan membuka halaman lain melalui iframe pada `#destinationFrame`.
2. Halaman iframe mengetahui mode embed dari parameter `?embed=1`, kemudian mengirim pesan `postMessage` ke halaman induk untuk menutup panel, memulai mini-game kota lama, atau membuka resep katalog yang dipilih.
3. Halaman induk memeriksa origin dan sumber pesan sebelum memproses perintah yang diterima.
4. `ayomasak-index-masakan.html` menampilkan seluruh resep dari enam kota; memilih kartu membuka pop-up backstory dan tidak langsung berpindah ke dapur.
5. `ayomasak-dapur.html` menyusun bahan sesuai resep katalog, menerima drag-and-drop, memvalidasi bahan, dan membuka cerita setelah masakan berhasil.
6. Setelah backstory hasil masak ditutup, dapur mencatat resep yang selesai. Tombol `Lanjut` membuka resep pertama yang belum selesai dalam urutan katalog, sehingga pilihan awal resep tidak melewatkan masakan lain. Setelah semua resep kota selesai, stempel ditampilkan bersama pilihan kota berikutnya atau menu utama.
7. Buku Stempel beranda menghitung kelengkapan tiga resep per kota dari `completedDishesByCity`; mini-game peta lama tidak membuka stempel katalog.

Tombol Pengaturan dan menu utama di beranda memakai aset lapisan dari `assets/Buttons/`. Bingkai luar tetap diam; hanya kotak bagian dalam yang bergerak turun 30% dari kedalaman tekan saat hover dan 100% saat ditekan. Ukuran serta posisi CSS tombol dipertahankan; label aksesibilitas dan aksi klik tetap berada pada tombol HTML.

Tombol kembali ke peta dan petunjuk resep di dapur juga memakai lapisan bingkai dan bagian dalam dari folder tersebut dengan animasi tekan yang sama. Ukuran serta posisi tombol dapur tetap dipertahankan, dan kontrol HTML tetap menangani aksi serta aksesibilitasnya.

## HTML: fungsi struktur halaman

HTML memberi struktur dan identitas elemen. CSS visualnya ada di `style.css`, sedangkan interaksi ditangani oleh JavaScript di tiap halaman.

### Beranda — `index.html`

- `.map-screen`: peta, label kota, ringkasan progres, tombol pengaturan, dan menu bawah.
- `#guideOverlay`: petunjuk permainan.
- `#stampOverlay` dan `#stampList`: buku stempel; isinya dibuat ulang dari progres tersimpan.
- `#destinationSheet`, `#destinationPanel`, dan `#destinationFrame`: wadah iframe untuk destinasi, daftar masakan, dan pengaturan.
- `.game-screen`: mini-game memasak bertahap yang masih tersedia di halaman ini. Ini berbeda dari dapur utama `ayomasak-dapur.html`.
- ID pada elemen interaktif menjadi penghubung JavaScript dengan HTML; perubahan nama ID perlu disesuaikan di script.

### Dapur — `ayomasak-dapur.html`

- `#ingredientGrid`: rak bahan; tombol bahan diisi berdasarkan resep yang aktif. Tiga ikon bahan utama per hidangan dicrop dari `assets/Jawa/Panduan Bahan Utama.png`, dipertajam, lalu ditampilkan pada kotak bahan resep terkait.
- `#panDropZone`, `.pan-body`, `.pan-lid`, `.pan-steam`, dan `#panItems`: wajan, tutup animasi, asap, dan isi bahan/hasil.
- `#cookButton` dan `#cookFeedback`: mulai memasak selama 3 detik, lalu menampilkan hasil matang atau gosong.
- `#storyScroll`: gulungan cerita yang menampilkan keberhasilan, foto hidangan Jakarta atau emoji untuk hidangan yang belum memiliki foto, judul, dan sejarah. Isinya dapat digulir.
- `#recipeHintButton` dan `#recipeHint`: membuka gulungan resep untuk hidangan aktif, menampilkan bahan yang dibutuhkan serta status bahan yang sudah dimasukkan.
- `#stampReward`: notifikasi hadiah setelah cerita ditutup.
- `#continueCookingButton`: muncul setelah backstory ditutup untuk membuka resep berikutnya.
- `#kitchenHomeBtn`: kembali ke beranda.

### Halaman pendukung

- `ayomasak-destinasi.html`: menampilkan tiga hidangan dari katalog untuk kota yang dipilih; klik tiap kartu memulai resep tersebut, sedangkan destinasi lama nonkatalog tetap menampilkan satu hidangan.
- `ayomasak-index-masakan.html`: membentuk 18 kartu bergambar, dikelompokkan menurut enam daerah; klik kartu membuka pop-up backstory, dan tombol tutup/Escape mengembalikan fokus ke kartu.
- `ayomasak-pengaturan.html`: tombol tutup/konfirmasi dan dua slider volume yang menyimpan perubahan saat digeser.
- Ketiga halaman tersebut menambahkan kelas `embedded` pada `<html>` saat menerima parameter `embed=1`; CSS menggunakannya untuk menyesuaikan ukuran panel iframe.

## CSS: kelompok aturan di `style.css`

- **Studio/prototipe awal**: bagian awal stylesheet dibatasi oleh `body.studio-preview`. Bagian ini tidak berlaku pada halaman aplikasi karena body aplikasi menggunakan kelas halaman tersendiri.
- **Beranda (`body.page-home`)**: peta, label kota, topbar, tombol pengaturan/menu, overlay, kartu stempel, mini-game, dan sheet iframe. Media query menyesuaikan viewport kecil.
- **Dapur (`body.page-kitchen`)**: panggung dapur, pesanan, koki, rak bahan, sel bahan, wajan, tombol memasak, cerita gulung, party popper, dan notifikasi stempel.
- **Destinasi (`body.page-destination`)**: bingkai dialog, panel, tombol tutup, kartu hidangan, pesan kota, serta layout embed.
- **Daftar masakan (`body.page-recipes`)**: bingkai daftar resep, kartu yang dapat diklik, dan layout embed.
- **Pengaturan (`body.page-settings`)**: dialog, tombol, slider musik dan efek suara, dan layout embed.
- **Token desain**: warna, tipografi, radius, bayangan, serta ukuran ditetapkan dalam blok `:root` yang sudah dibatasi pada kelas halaman.
- **Interaksi visual**: `:hover`, `:active`, `.selected`, `.is-drop-target`, `.is-open`, dan `.is-closing` menggambarkan keadaan komponen.
- **Animasi**: `ingredient-picked`, `success-pop`, `party-pop-left`, `party-pop-right`, `stamp-reward-appear`, `drift`, `map-wave-to-shore`, dan `map-bird-cross` mengatur animasi yang sesuai. `prefers-reduced-motion` mengurangi gerakan bila diminta perangkat.
- **Ukuran responsif**: media query `max-width` mengatur layout mobile/tablet. Jika menambah halaman, tambahkan scope kelas body agar aturan tidak memengaruhi halaman lain.

## JavaScript: fungsi beranda `index.html`

### Peta dan navigasi

| Fungsi                                 | Tanggung jawab                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `getMaxMapZoom()`                      | Membatasi zoom maksimum sesuai resolusi asli gambar peta agar tidak diperbesar melewati detail piksel yang tersedia. |
| `applyMapTransform()`                  | Menerapkan tingkat zoom dan posisi geser horizontal/vertikal serta menjaga peta tetap dalam batas viewport.          |
| `zoomMap(nextZoom, clientX, clientY)`  | Mengubah zoom di sekitar titik yang dipilih, melalui roda mouse atau gestur pinch.                                   |
| `startMapPointer(event)`               | Memulai interaksi pointer untuk menggeser peta atau mencatat dua titik sentuh untuk pinch.                           |
| `moveMapPointer(event)`                | Menggeser peta dua arah atau memperbesar/memperkecilnya saat dua jari menjauh atau mendekat.                         |
| `endMapPointer(event)`                 | Melepas pointer capture, mengakhiri drag/pinch, dan mencegah klik kota yang tidak sengaja setelah peta digeser.      |
| `openDestination(regionKey)`           | Membuka sheet bawah dengan `ayomasak-destinasi.html` untuk kota yang dipilih.                                        |
| `openHomePanel(path, title, centered)` | Membuka halaman embed umum; parameter `centered` digunakan untuk menempatkan Pengaturan di tengah.                   |
| `closeDestination()`                   | Menutup sheet iframe dan memperbarui status aksesibilitasnya.                                                        |
| `showScreen(name)`                     | Mengaktifkan tampilan peta atau mini-game yang tertanam pada beranda.                                                |

Peta memakai `assets/maps-crisp-clean.png`, hasil penajaman `assets/maps.jpeg` yang membersihkan lokasi ombak asli; detail tersebut dipisah ke `assets/maps-wave-details.png` lalu dianimasikan menuju pulau dan memudar sebelum mencapai pantai. Siluet burung terbang melintasi peta. Animasi dekoratif tidak menangkap pointer dan dinonaktifkan saat preferensi pengurangan gerakan aktif. Tidak ada tombol zoom; roda mouse dan gestur pinch mengatur zoom. Batas zoom dihitung dari dimensi piksel gambar dan ukuran tampilnya. Listener `resize`, `pointerup`, `pointercancel`, dan `lostpointercapture` menjaga batas peta dan status interaksi tetap konsisten.

### Progres, overlay, dan buku stempel

| Fungsi                | Tanggung jawab                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| `persistProgress()`   | Menyimpan progres mini-game lama, bintang, dan progres resep/stempel katalog ke `localStorage`. |
| `updateMapProgress()` | Memperbarui bintang, indikator kota selesai, serta kota yang terbuka/terkunci.                  |
| `renderStampGrid()`   | Membuat ulang enam slot buku stempel dan menandai koleksi yang sudah terbuka.                   |
| `showOverlay(name)`   | Membuka petunjuk atau buku stempel; buku dirender ulang sebelum ditampilkan.                    |
| `hideOverlay(name)`   | Menutup overlay petunjuk atau buku stempel.                                                     |

Pesan dari iframe hanya diproses bila `event.origin` dan `event.source` sesuai. Jenis pesan yang dipakai:

- `close-destination` / `close-home-panel`: menutup sheet.
- `start-cooking`: membuka dapur untuk kota yang dikirim.
- `start-recipe`: membuka resep katalog tertentu dari kartu pilihan di halaman destinasi.

### Mini-game memasak di beranda

| Fungsi                             | Tanggung jawab                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| `getCurrentRegion()`               | Mengambil data kota yang sedang dimainkan.                                                   |
| `renderPotSelection()`             | Memperbarui tampilan bahan di panci mini-game.                                               |
| `resetSelection()`                 | Menghapus bahan yang dipilih untuk langkah saat ini.                                         |
| `renderTabs()`                     | Membuat tombol tab langkah resep dan memilih langkah aktif.                                  |
| `renderIngredientList()`           | Membuat tombol bahan; klik menambah/menghapus bahan serta memperbarui umpan balik.           |
| `renderRecipeList()`               | Menampilkan langkah resep dan menandai langkah yang telah selesai.                           |
| `render()`                         | Memperbarui keseluruhan tampilan mini-game dari state saat ini.                              |
| `finishCurrentStep()`              | Memvalidasi bahan langkah, memberi bintang, memperbarui progres, dan menyelesaikan kota.     |
| `openGame(regionKey)`              | Membuka mini-game kota jika sudah terbuka; jika terkunci, memberi pesan dan kembali ke peta. |
| `playTone(freq, duration, volume)` | Mengirim efek UI ke mesin audio bersama; volumenya mengikuti slider efek suara.              |

Event tombol pada beranda menghubungkan kota ke destinasi, tombol kembali ke peta, `Selesai`/`Reset` ke mini-game, menu bawah ke petunjuk/buku/daftar masakan, dan tombol pengaturan ke panel tengah.

## JavaScript: fungsi dapur `ayomasak-dapur.html`

Katalog enam kota dan 18 resep ada di `recipe-catalog.js`. Dapur menggunakan `pantry` untuk nama/emoji bahan dan tetap mendukung `recipes`/`cookingSequence` untuk alur mini-game lama. Query URL memilih kota (`region`) dan resep katalog (`dish`).

| Fungsi                                          | Tanggung jawab                                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `renderPan()`                                   | Membuat ulang ikon bahan yang berada di dalam wajan dan memperbarui kelas status wajan.                                                                                                                       |
| `toggleIngredient(name)`                        | Menambahkan atau mengeluarkan bahan, memperbarui tombol rak dan wajan, serta mengeluarkan efek suara. Terkunci selama dan setelah proses memasak.                                                             |
| `isOverPan(clientX, clientY)`                   | Memeriksa apakah pointer berada di dalam elips badan wajan.                                                                                                                                                   |
| `moveDragGhost(clientX, clientY)`               | Mengikuti posisi pointer dengan ikon bahan dan menyorot wajan bila menjadi target.                                                                                                                            |
| `finishIngredientDrag(event, dropped)`          | Menyelesaikan drag; hanya memasukkan bahan jika dilepas di dalam wajan, lalu menghapus ghost dan status drag.                                                                                                 |
| `showCookingStampReward()`                      | Mencatat ID resep yang berhasil dimasak; memberi stempel dan menampilkan gambar stempel hanya setelah semua resep kota selesai. Saat stempel baru didapat, tampilkan pilihan kota berikutnya atau menu utama. |
| `finishStoryClose()`                            | Menyelesaikan animasi tutup cerita, menyembunyikan gulungan, memberi stempel, dan mengatur tombol lanjut sesuai progres kota.                                                                                 |
| `showSuccessfulCook()`                          | Menampilkan hasil masakan, efek berhasil, dan backstory setelah waktu memasak selesai dengan bahan yang tepat.                                                                                                |
| `restartCooking()`                              | Mengosongkan bahan gosong dan membuka kembali rak bahan agar pemain dapat mencoba resep lagi.                                                                                                                 |
| `renderRecipeHint()`                            | Menampilkan bahan dan status pemilihan sesuai resep aktif di pop-up gulungan.                                                                                                                                 |
| `closeRecipeHint()` / `finishRecipeHintClose()` | Menjalankan animasi tutup pop-up resep dan mengembalikan fokus ke tombol lampu.                                                                                                                               |
| Listener `continueCookingButton`                | Membuka resep berikutnya di kota katalog yang sama; setelah resep ketiga kembali ke indeks masakan. Alur mini-game lama tetap memakai `cookingSequence`.                                                      |
| Listener `cookButton`                           | Memeriksa resep, menutup wajan, menampilkan asap/getaran selama 3 detik, lalu menentukan hasil gosong atau matang.                                                                                            |

Event utama di dapur:

- `pointerdown` pada bahan membuat ghost dan memulai drag; `pointermove` menggerakkan ghost; `pointerup`/`pointercancel` menyelesaikan atau membatalkan drag.
- Aktivasi tombol bahan melalui keyboard memanggil `toggleIngredient()`.
- Klik `Masak!` memeriksa bahan resep, lalu menutup wajan dan menjalankan asap/getaran selama 3 detik. Bahan yang salah atau kurang membuat hasil gosong dan tombol `Mulai Ulang` mengosongkan wajan untuk percobaan baru; bahan yang benar menampilkan hasil, animasi berhasil, dan backstory.
- Setelah backstory ditutup dan animasi gulungan selesai, progres resep tersimpan. Notifikasi menampilkan progres kota; gambar stempel kota baru muncul setelah ketiga resepnya selesai. Tombol `Lanjut` berurutan di kota tersebut dan kembali ke indeks sesudah resep terakhir.
- Saat stempel kota baru didapat, dua pilihan muncul: `Lanjut ke kota berikutnya` membuka kota berikutnya sesuai urutan katalog (memilih resep yang belum selesai, atau resep pertama bila seluruh resep kota itu telah selesai), sedangkan `Kembali ke menu utama` membuka beranda.
- Tombol lampu membuka gulungan resep untuk masakan aktif; setiap bahan menunjukkan apakah sudah berada di wajan. Tombol `Tutup` atau `Escape` menutupnya dengan animasi gulungan.
- Klik `Tutup` pada backstory memulai animasi gulungan menutup. `transitionend` atau fallback timer menyelesaikan tutupnya.
- Klik tombol silang notifikasi menyembunyikan hadiah.
- Klik ikon beranda kembali ke `index.html`.

## JavaScript: halaman pendukung

### `ayomasak-destinasi.html`

- Membaca `region` dari query URL lalu memilih data kota/hidangan.
- Mengisi nama, emoji, label aksesibilitas, dan pesan kota pada kartu.
- Listener klik kartu mengirim `start-cooking` ke parent bila embedded; jika dibuka mandiri, navigasi langsung ke dapur.
- Listener tombol tutup mengirim `close-destination` bila embedded atau kembali ke beranda jika mandiri.

### `ayomasak-index-masakan.html`

- Listener klik `.dish-card` membaca kota dan ID hidangan dari `recipe-catalog.js`, lalu menampilkan pop-up backstory tanpa navigasi ke dapur.
- Listener tombol tutup mengirim `close-home-panel` bila embedded atau kembali ke beranda.
- Tombol `Tutup`, klik area di luar pop-up, atau `Escape` menutup backstory dan mengembalikan fokus ke kartu; `Escape` menutup panel induk hanya bila backstory tidak sedang terbuka.

### `ayomasak-pengaturan.html`

- `returnToHome()` mengirim `close-home-panel` ke parent saat embedded atau menavigasi ke beranda saat mandiri.
- Tombol tutup dan konfirmasi sama-sama memanggil `returnToHome()`.
- Listener `Escape` menutup halaman pengaturan bila embedded.
- Slider Musik dan Efek suara membaca nilai tersimpan, memperbarui persentase, lalu menyimpan perubahan saat digeser.
- Saat halaman pengaturan tertanam, perubahan volume dikirim ke halaman induk agar audio yang sedang dimainkan ikut berubah.

### `audio.js`

- Menyimpan volume musik dan efek secara terpisah pada `localStorage` dengan key `ayoMasakAudioSettings`.
- Memainkan musik latar sintetis lembut menggunakan Web Audio setelah interaksi pertama pengguna, mengikuti kebijakan autoplay browser.
- Menerapkan volume musik dan efek pada jalur audio terpisah; efek mini-game beranda dan dapur mengikuti slider efek.
- Mengirim permintaan mulai musik dan perubahan volume dari halaman embed ke halaman induk.

### `script.js`

- Listener `DOMContentLoaded` menambahkan kelas `concept-ready` ke `<body>`.
- File ini tidak memiliki tag `<script src="script.js">` di halaman saat ini, sehingga listener tersebut tidak berjalan dalam aplikasi kecuali file ditautkan.

## Data, penyimpanan, dan pengembangan

- Progres disimpan lokal pada browser dengan key `ayoMasakProgress`; data tidak otomatis tersinkron antarperangkat/browser.
- Volume musik dan efek disimpan lokal pada browser dengan key `ayoMasakAudioSettings`.
- `completedRegions` dan `stars` berasal dari mini-game beranda. `completedDishesByCity` menyimpan ID hidangan katalog yang berhasil dimasak, dan `cookingStamps` mencatat kota yang sudah menerima stempel. Stempel katalog dibuka hanya dengan menyelesaikan ketiga resep kota; progres mini-game lama tidak dihitung.
- `regionOrder` menentukan urutan kota pada peta/mini-game lama; urutan buku stempel mengikuti `recipe-catalog.js`.
- Untuk menambah resep katalog, tambahkan hidangan ke kota yang sesuai di `recipe-catalog.js`, pastikan semua bahan ada di `pantry`, dan sediakan gambar bernama sama dengan ID resep di folder aset kota (kecuali jika `image` ditentukan langsung).
- Kartu indeks memakai gambar bernama sesuai ID hidangan di folder aset kota; backstory memakai gambar bila `image` di katalog diisi, atau emoji sebagai pengganti.
- Indeks masakan membuat kartu otomatis dari `recipe-catalog.js`; validasi resep dari iframe di beranda juga membaca katalog yang sama.
- Agar dokumentasi tetap akurat, perbarui tabel fungsi dan alur setelah menambah/mengubah fungsi, jenis pesan iframe, format progres, atau kelas CSS utama.

## Command pengembangan

Command berikut ditujukan untuk dijalankan dari PowerShell di folder proyek. Proyek ini berupa halaman HTML/CSS/JavaScript statis dan tidak memiliki `package.json`; karena itu, jalankan preview dengan server Python, bukan `npm run`.

### Menjalankan dan membuka aplikasi

```powershell
# Masuk ke folder proyek
Set-Location "D:\PROJECT LOMBA"

# Jalankan server preview; biarkan terminal ini tetap terbuka
py -m http.server 8000 --bind 127.0.0.1
```

Buka `http://127.0.0.1:8000/index.html` di browser. Untuk menghentikan server, tekan `Ctrl+C` pada terminal yang menjalankannya.

Untuk membuka file di VS Code:

```powershell
code index.html
code ayomasak-dapur.html
code style.css
code DOKUMENTASI-FUNGSI.md
```

### Mencari implementasi berdasarkan fitur

Jalankan command dari folder proyek. `rg -n` menampilkan nomor baris; pencarian beberapa file sekaligus membantu menelusuri struktur HTML, styling, dan event/fungsi terkait.

| Fitur                               | HTML dan JavaScript      | CSS                  |
| ----------------------------------- | ------------------------ | -------------------- | --------------------------- | --------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------- | ----------------------------- | ---------------------- | ----------------------- | -------------------------- |
| Peta, kota, geser, dan zoom         | `rg -n "map-screen       | region-btn           | startMapPointer             | moveMapPointer                                                  | zoomMap                           | openDestination" index.html`                                                                 | `rg -n "page-home.\*(map                   | region)                            | map-stage                     | region-btn" style.css` |
| Panel destinasi dan navigasi iframe | `rg -n "destinationSheet | destinationFrame     | openDestination             | openHomePanel                                                   | start-cooking                     | start-recipe" index.html ayomasak-destinasi.html ayomasak-index-masakan.html`                | `rg -n "destination                        | destination-sheet                  | destination-panel" style.css` |
| Buku stempel dan progres            | `rg -n "stampOverlay     | stampList            | renderStampGrid             | persistProgress                                                 | ayoMasakProgress                  | showCookingStampReward" index.html ayomasak-dapur.html`                                      | `rg -n "stamp                              | overlay-panel" style.css`          |
| Mini-game memasak di beranda        | `rg -n "game-screen      | renderIngredientList | renderRecipeList            | finishCurrentStep                                               | openGame                          | resetSelection" index.html`                                                                  | `rg -n "page-home.\*(game                  | ingredient                         | recipe                        | pot)                   | game-screen" style.css` |
| Rak bahan, wajan, dan drag-and-drop | `rg -n "ingredientGrid   | panDropZone          | panItems                    | toggleIngredient                                                | isOverPan                         | moveDragGhost                                                                                | finishIngredientDrag" ayomasak-dapur.html` | `rg -n "page-kitchen.\*(ingredient | pan                           | drop                   | drag)                   | is-drop-target" style.css` |
| Validasi memasak dan feedback       | `rg -n "cookButton       | cookFeedback         | cookButton.addEventListener | resep                                                           | recipe" ayomasak-dapur.html`      | `rg -n "page-kitchen.\*(cook                                                                 | feedback                                   | success)" style.css`               |
| Backstory dan animasi gulungan      | `rg -n "storyScroll      | storyCloseButton     | finishStoryClose            | transitionend                                                   | backstories" ayomasak-dapur.html` | `rg -n "story-scroll                                                                         | is-open                                    | is-closing                         | party-pop" style.css`         |
| Kartu resep dan pengaturan          | `rg -n "dish-card        | data-dish            | returnToHome                | confirm-button                                                  | musicVolume                       | effectsVolume" ayomasak-index-masakan.html ayomasak-pengaturan.html ayomasak-destinasi.html` | `rg -n "page-(recipes                      | settings                           | destination).\*(card          | button                 | volume                  | dialog)" style.css`        |
| Musik latar dan efek suara          | `rg -n "playMusicLoop    | setSettings          | playTone                    | ayoMasakAudioSettings" audio.js index.html ayomasak-dapur.html` | `rg -n "volume-settings           | volume-control\_\_slider" style.css`                                                         |

Contoh alur saat mengubah fitur drag bahan:

```powershell
# Temukan elemen HTML dan fungsi/event JavaScript yang terlibat
rg -n "ingredientGrid|panDropZone|finishIngredientDrag" ayomasak-dapur.html

# Temukan aturan tampilan bahan dan target wajan
rg -n "page-kitchen.*(ingredient|pan|drop)|is-drop-target" style.css

# Buka kedua file untuk diedit
code ayomasak-dapur.html style.css
```

Untuk fitur baru, gunakan pola yang sama: cari ID/class elemen di HTML, cari selector ber-scope `body.page-*` pada `style.css`, lalu cari fungsi atau `addEventListener` di halaman yang menangani interaksi.

### Pemeriksaan cepat setelah perubahan

```powershell
# Pastikan semua halaman menautkan stylesheet bersama
rg -n 'stylesheet.*style\.css' -g "*.html" .

# Periksa apakah ada style inline yang perlu dipindahkan ke style.css
rg -n 'style\s*=' -g "*.html" .

# Periksa selector pseudo-element yang harus memiliki spasi sebelum *::before/*::after
rg -n 'page-[a-z-]+\*::(before|after)' style.css
```

Pencarian `style=` dan pseudo-element dapat menghasilkan kode keluar `1` bila tidak menemukan kecocokan; dalam kasus tersebut, itu berarti tidak ada hasil pencarian. Setelah mengubah tampilan atau interaksi, muat ulang halaman di browser dan uji alur terkait, termasuk mode embed melalui halaman beranda.
