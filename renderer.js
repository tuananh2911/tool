// Make sure to wait for the DOM to be ready before accessing elements
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startButton").addEventListener("click", async () => {
        try {
            const func = async () => {
                const comment = document.getElementById('commentInput').value
                const selectedAccounts = document.querySelectorAll('.account-checkbox:checked');
                const selectedGroups = document.querySelectorAll('.group-checkbox:checked');
                const selectedGroupUsernames = Array.from(selectedGroups)
                    .map(group => group.nextSibling.textContent.trim());
                const selectedAccountUsernames = Array.from(selectedAccounts)
                    .map(account => account.nextSibling.textContent.trim());
                const accountLocalStorage =  JSON.parse(localStorage.getItem('accounts'))
                const accounts = [];
                for(let account of accountLocalStorage){
                    for(let acc of selectedAccountUsernames){
                        if(acc === account.username){
                            accounts.push(account)
                        }
                    }
                }
                let urls = [];
                const groupsLocalStorage =  JSON.parse(localStorage.getItem('groups'))
                console.log('groups',groupsLocalStorage)
                for(let url of groupsLocalStorage){
                    for(let u of selectedGroupUsernames){
                        if(u === url.nameGroup){
                            urls.push(url.linkGroup)
                        }
                    }
                }
                for (let account of accounts) {
                    console.log(comment);
                    const response = await window.versions.ping(urls,account.username, account.password, comment);
                }
            }

            func()
        } catch (error) {
            alert(error); // Handle errors
        }
    });
});
function addGroup(linkGroup,nameGroup){
    const groupList = document.getElementById('groupList');
    const groupItem = document.createElement('div');
    groupItem.classList.add('flex', 'items-center', 'justify-between', 'mb-2', 'p-2', 'border', 'rounded', 'bg-white');
    groupItem.innerHTML = `
                <label class="flex items-center">
                    <input type="checkbox" class="mr-2 group-checkbox">
                    ${nameGroup}
                </label>
            `;
    groupList.appendChild(groupItem);
    saveGroupsToLocalStorage(linkGroup, nameGroup);
    // Clear input field
    document.getElementById('groupLinkInput').value = '';
}
function saveAccountToLocalStorage(username, password) {
    // Retrieve existing accounts from localStorage
    const existingAccounts = JSON.parse(localStorage.getItem('accounts')) || [];

    // Add the new account
    existingAccounts.push({username, password});
    console.log('existAcc', existingAccounts);
    // Save the updated accounts back to localStorage
    localStorage.setItem('accounts', JSON.stringify(existingAccounts));
}

function saveGroupsToLocalStorage(linkGroup, nameGroup) {
    // Retrieve existing accounts from localStorage
    const existingGroups = JSON.parse(localStorage.getItem('groups')) || [];

    // Add the new account
    existingGroups.push({linkGroup, nameGroup});

    // Save the updated accounts back to localStorage
    localStorage.setItem('groups', JSON.stringify(existingGroups));
}
function handleNameGroup() {
    try {
        const func = async () => {
            const linkGroup = document.getElementById("groupLinkInput").value
            const response = await window.versions.getNameGroup(linkGroup,'iotsystem2911@gmail.com','Tu@n@nh2911')
            addGroup(linkGroup,response)
        }

        func()
    } catch (error) {
        alert(error); // Handle errors
    }
}

// src/renderer.js
document.addEventListener('DOMContentLoaded', function () {
    const addAccountButton = document.getElementById('addAccountButton');
    const accountList = document.getElementById('accountList');
    const addGroupButton = document.getElementById('addGroupButton');
    const groupList = document.getElementById('groupList');
    const deleteAccountButton = document.getElementById('deleteAccountButton');
    const deleteGroupButton = document.getElementById('deleteGroupButton');
    const commentInput = document.getElementById('commentInput');
    const imageInput = document.getElementById('imageInput');
    const uploadImageButton = document.getElementById('uploadImageButton');
    const uploadedImage = document.getElementById('uploadedImage');
    const randomIconSelect = document.getElementById('randomIconSelect');
    const randomIconButton = document.getElementById('randomIconButton');

    // Thêm sự kiện cho nút upload ảnh
    uploadImageButton.addEventListener('click', function () {
        // Kích hoạt sự kiện click cho input type file
        imageInput.click();
    });

    // Thêm sự kiện khi người dùng chọn ảnh
    imageInput.addEventListener('change', function () {
        const selectedImage = imageInput.files[0];

        if (selectedImage) {
            // Thực hiện xử lý upload ảnh ở đây (có thể sử dụng FileReader để hiển thị ảnh trực tiếp)
            const reader = new FileReader();

            reader.onload = function (e) {
                // Hiển thị ảnh đã chọn
                uploadedImage.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" class="w-full">`;
            };

            reader.readAsDataURL(selectedImage);
        }
    });

    // Thêm sự kiện cho nút random icon
    randomIconButton.addEventListener('click', function () {
        // Lấy giá trị của option được chọn trong randomIconSelect
        const selectedIcon = randomIconSelect.value;

        // Lấy danh sách các option trong randomIconSelect
        const iconOptions = randomIconSelect.options;

        // Chọn ngẫu nhiên một option khác với option đã chọn ban đầu
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * iconOptions.length);
        } while (randomIconSelect.selectedIndex === randomIndex);

        // Chọn option ngẫu nhiên
        randomIconSelect.selectedIndex = randomIndex;

        // Thêm icon vào ô comment
        commentInput.value += ` <i class="fas ${selectedIcon}"></i>`;
    });

    addAccountButton.addEventListener('click', function () {
        const usernameInput = document.getElementById('usernameInput').value;
        const passwordInput = document.getElementById('passwordInput').value;

        if (usernameInput && passwordInput) {
            const accountItem = document.createElement('div');
            accountItem.classList.add('flex', 'items-center', 'justify-between', 'mb-2', 'p-2', 'border', 'rounded', 'bg-white');
            accountItem.innerHTML = `
                <label class="flex items-center">
                    <input type="checkbox" class="mr-2 account-checkbox">
                    ${usernameInput}
                </label>
            `;
            accountList.appendChild(accountItem);
            saveAccountToLocalStorage(usernameInput, passwordInput);
            // Clear input fields
            document.getElementById('usernameInput').value = '';
            document.getElementById('passwordInput').value = '';
        } else {
            alert('Please enter both username and password.');
        }
    });

    deleteAccountButton.addEventListener('click', function () {
        const selectedAccounts = document.querySelectorAll('.account-checkbox:checked');
        selectedAccounts.forEach(account => {
            const parent = account.parentNode.parentNode;
            if (parent) {
                parent.remove();

                // Update localStorage after deletion
                updateLocalStorageAccounts(selectedAccounts);
            }
        });
    });

    deleteGroupButton.addEventListener('click', function () {
        const selectedGroups = document.querySelectorAll('.group-checkbox:checked');
        selectedGroups.forEach(group => {
            const parent = group.parentNode.parentNode;
            if (parent) {
                parent.remove();
                // Update localStorage after deletion
                updateLocalStorageGroups(selectedGroups);
            }
        });
    });


    document.getElementById('startButton').addEventListener('click', function () {
        const selectedAccounts = document.querySelectorAll('.account-checkbox:checked');
        const selectedGroups = document.querySelectorAll('.group-checkbox:checked');

        // Process selected accounts and groups as needed
        console.log('Selected Accounts:', Array.from(selectedAccounts).map(account => account.nextSibling.textContent.trim()));
        console.log('Selected Groups:', Array.from(selectedGroups).map(group => group.nextSibling.textContent.trim()));
    });

    function loadAccountsFromLocalStorage() {
        // Retrieve accounts from localStorage
        const existingAccounts = JSON.parse(localStorage.getItem('accounts')) || [];

        // Display existing accounts in the UI (if needed)
        existingAccounts.forEach(account => {
            const accountItem = document.createElement('div');
            accountItem.classList.add('flex', 'items-center', 'justify-between', 'mb-2', 'p-2', 'border', 'rounded', 'bg-white');
            accountItem.innerHTML = `
                <label class="flex items-center">
                    <input type="checkbox" class="mr-2 account-checkbox">
                    ${account.username}
                </label>
            `;
            accountList.appendChild(accountItem);
        });
    }

    function loadGroupsFromLocalStorage() {
        // Retrieve accounts from localStorage
        const existingGroups = JSON.parse(localStorage.getItem('groups')) || [];

        // Display existing accounts in the UI (if needed)
        existingGroups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.classList.add('flex', 'items-center', 'justify-between', 'mb-2', 'p-2', 'border', 'rounded', 'bg-white');
            groupItem.innerHTML = `
                <label class="flex items-center">
                    <input type="checkbox" class="mr-2 group-checkbox">
                    ${group.nameGroup}
                </label>
            `;
            groupList.appendChild(groupItem);
        });
    }

    function updateLocalStorageAccounts(selectedAccounts) {
        // Retrieve existing accounts from localStorage
        const existingAccounts = JSON.parse(localStorage.getItem('accounts')) || [];
        // Remove deleted accounts from the array
        const selectedAccountUsernames = Array.from(selectedAccounts)
            .map(account => account.nextSibling.textContent.trim());
        const updatedAccounts = existingAccounts.filter(account => !selectedAccountUsernames.includes(account.username));

        // Save the updated accounts back to localStorage
        localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    }

    function updateLocalStorageGroups(selectedGroups) {
        const existingGroups = JSON.parse(localStorage.getItem('groups')) || [];
        // Remove deleted groups from the array
        const selectedGroupNames = Array.from(selectedGroups)
            .map(group => group.nextSibling.textContent.trim());

        const updatedGroups = existingGroups.filter(group => !selectedGroupNames.includes(group.nameGroup));

        // Save the updated groups back to localStorage
        localStorage.setItem('groups', JSON.stringify(updatedGroups));
    }

    // Load existing accounts from localStorage when the DOM is ready
    loadAccountsFromLocalStorage();
    loadGroupsFromLocalStorage();
});

