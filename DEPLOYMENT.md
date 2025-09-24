# 🚀 Инструкция по развертыванию на GitHub Pages

## 📋 Шаги для настройки GitHub Pages:

### 1. Настройка репозитория
1. Перейдите в **Settings** вашего репозитория на GitHub
2. Найдите раздел **Pages** в левом меню
3. В разделе **Source** выберите **"GitHub Actions"**

### 2. Проверка Actions
1. Перейдите на вкладку **Actions** в вашем репозитории
2. Убедитесь, что workflow "Deploy to GitHub Pages" запустился
3. Если есть ошибки, проверьте логи

### 3. Альтернативный способ - ручной деплой

Если GitHub Actions не работает, можно загрузить файлы вручную:

```bash
# 1. Соберите проект
npm run build

# 2. Создайте ветку gh-pages
git checkout -b gh-pages

# 3. Скопируйте содержимое dist в корень
# (в Windows PowerShell)
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force

# 4. Удалите папку dist
Remove-Item -Path "dist" -Recurse -Force

# 5. Зафиксируйте изменения
git add .
git commit -m "Deploy to GitHub Pages"

# 6. Отправьте на GitHub
git push origin gh-pages

# 7. Вернитесь на master
git checkout master
```

### 4. Настройка источника Pages
1. В **Settings > Pages**
2. Выберите **"Deploy from a branch"**
3. Выберите ветку **"gh-pages"**
4. Папка: **"/ (root)"**

## 🔗 Ссылка на сайт
После успешного деплоя ваш сайт будет доступен по адресу:
**https://evgeniy1317.github.io/QR_React/**

## 🛠️ Устранение проблем

### Белый экран
- Проверьте консоль браузера (F12)
- Убедитесь, что все файлы загружены
- Проверьте правильность путей в vite.config.js

### 404 ошибки
- Убедитесь, что base path настроен правильно
- Проверьте, что все статические ресурсы доступны

### Actions не запускается
- Проверьте права доступа в Settings > Actions
- Убедитесь, что workflow файл находится в правильном месте

## 📞 Поддержка
Если возникли проблемы, проверьте:
1. Логи в GitHub Actions
2. Консоль браузера
3. Настройки Pages в репозитории


