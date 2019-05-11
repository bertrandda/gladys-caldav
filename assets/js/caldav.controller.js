(() => {
    'use strict';

    angular
        .module('gladys')
        .controller('calDavCtrl', calDavCtrl);

    calDavCtrl.$inject = ['paramUserService'];

    function calDavCtrl(paramUserService) {
        const vm = this;

        vm.services = ['Other', 'iCloud'];
        vm.service = '';
        vm.caldavUrl = '';
        vm.username = '';
        vm.password = '';

        vm.init = init;
        vm.saveParams = saveParams;

        async function init() {
            const data = await paramUserService.get();
            vm.params = data.data;

            vm.paramUrl = vm.params.find(param => param.name === 'CALDAV_URL');
            vm.paramUsername = vm.params.find(param => param.name === 'CALDAV_USERNAME');
            vm.paramPassword = vm.params.find(param => param.name === 'CALDAV_PASSWORD');

            vm.caldavUrl = vm.paramUrl ? vm.paramUrl.value : '';
            vm.username = vm.paramUsername ? vm.paramUsername.value : '';
            vm.password = vm.paramPassword ? vm.paramPassword.value : '';
        }

        async function saveParams() {
            let param = {
                name: 'CALDAV_URL',
                value: getUrl()
            }

            if(vm.paramUrl) await paramUserService.update('CALDAV_URL', param);
            else await paramUserService.create(param);

            param = {
                name: 'CALDAV_USERNAME',
                value: vm.username
            }

            if(vm.paramUsername) await paramUserService.update('CALDAV_USERNAME', param);
            else await paramUserService.create(param);

            param = {
                name: 'CALDAV_PASSWORD',
                value: vm.password
            }

            if(vm.paramPassword) await paramUserService.update('CALDAV_PASSWORD', param);
            else await paramUserService.create(param);
        }

        function getUrl() {
            switch (vm.service) {
                case 'iCloud':
                    return 'icloud.com';
                default:
                    return vm.caldavUrl;
            }
        }
    }
})();