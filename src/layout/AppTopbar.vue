<script setup>
import { useLayout } from '@/layout/composables/layout';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();


// Get user info from store
const userName = computed(() => store.getters['auth/currentUser']?.userName || '');
const userEmail = computed(() => store.getters['auth/currentUser']?.email || '');
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);


// Logout function
// Improved logout function
const logout = async () => {
  try {
    console.log('Logging out...');
    await store.dispatch('auth/logout');
    console.log('Logout successful, redirecting to login page');
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, still try to redirect to login
    router.push('/auth/login');
  }
};



</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 1769 1567">
                    <path style="fill:#ffffff; stroke:none;" d="M0 0L0 1418C1.95905 1413.46 2.17586 1407.86 3.37423 1403C5.6812 1393.65 8.76525 1384.72 12.8889 1376C20.2201 1360.5 29.9721 1345.82 38.5756 1331C52.4856 1307.03 66.3547 1283.03 80.1497 1259C130.735 1170.87 181.57 1082.88 232.576 995C360.455 774.661 488.807 554.465 614.719 333C661.134 251.361 708.871 170.471 755.579 89C763.156 75.7838 770.253 61.9307 779.808 50C800.298 24.4144 833.26 2.44934 867 1C860.564 -1.70068 850.951 0 844 0L793 0L615 0L0 0z"/>
                    <path style="fill:#017ebc; stroke:none;" d="M867 0.428223C837.878 4.59839 810.042 16.8691 789.286 38.1698C766.964 61.0775 752.942 92.4877 737.15 120C706.105 174.083 674.594 227.9 643.579 282C477.987 570.838 309.209 857.86 144.15 1147C114.014 1199.79 83.7744 1252.58 52.9892 1305C43.4407 1321.26 34.0532 1337.62 24.7191 1354C18.0266 1365.75 11.1717 1377.16 6.69522 1390C-7.4719 1430.62 0.151398 1477.08 24.7207 1512C47.5823 1544.49 83.9794 1563.11 123 1566.83C141.017 1568.55 159.898 1567 178 1567L425 1567L1262 1567L1527 1567L1609 1567C1626.96 1567 1645.33 1568.16 1663 1564.34C1681.44 1560.35 1698.57 1552.82 1714 1541.96C1759.65 1509.85 1778.66 1448.88 1763.57 1396C1756.79 1372.24 1742.03 1351.22 1729.85 1330C1708.02 1291.96 1685.98 1254.04 1664.15 1216C1556.07 1027.72 1447.4 839.762 1338.42 652C1264.63 524.857 1192.44 396.759 1117.99 270C1088.94 220.541 1060.41 170.746 1031.85 121C1016.72 94.6456 1003.27 64.7076 982.829 42C954.588 10.6227 908.841 -5.56335 867 0.428223z"/>
                    <path style="fill:#ffffff; stroke:none;" d="M901 0C908.221 3.11475 917.339 3.53125 925 5.88501C939.666 10.391 953.996 17.9003 966 27.4498C996.772 51.9294 1013.09 89.6819 1032.42 123C1068.56 185.256 1104.29 247.743 1140.42 310C1288.99 565.986 1437.21 822.222 1584.42 1079C1627.87 1154.79 1671.57 1230.44 1715.42 1306L1741.42 1351C1754.71 1373.9 1767.98 1397.74 1768 1425C1769.66 1421.04 1769 1416.26 1769 1412L1769 1388L1769 1304L1769 1012L1769 0L901 0M842 439.428C829.382 441.236 818.093 445.673 807 451.862C793.513 459.386 781.643 470.275 774.323 484C758.789 513.129 765.641 550.481 788.286 573.83C809.86 596.074 842.051 603.963 872 599.714C884.191 597.985 896.691 593.364 907 586.655C916.793 580.282 925.27 572.629 931.961 563C937.633 554.836 942.053 545.647 944.522 536C959.337 478.095 894.7 431.878 842 439.428M702 661C713.306 665.865 726.87 667.443 739 669.13C764.04 672.613 789.304 673.389 814 679.235C823.608 681.509 833.124 684.934 842 689.259C846.321 691.365 851.919 696.122 857 695.381C860.537 694.866 863.283 691.732 866 689.677C869.984 686.663 874.417 684.387 879 682.427C893.936 676.041 911.013 673.575 927 671.271C947.292 668.347 967.777 666.805 988 663.414C997.279 661.857 1007.84 660.697 1015 654C1005.51 651 994.849 650.148 985 648.729C969.361 646.476 953.714 644.402 938 642.831C885.151 637.547 831.749 636.192 779 643.729C761.465 646.235 744.271 649.685 727 653.576C719.079 655.361 708.911 656.657 702 661M1146 920C1141.33 908.785 1134.43 898.713 1128.78 888C1107.62 847.895 1085.94 788.914 1123.04 751.015C1129.6 744.31 1137.6 739.324 1146 735.258C1163.22 726.921 1182.1 722.53 1201 720.286C1209.8 719.241 1223.39 721.558 1231 717C1211.14 705.455 1186.27 699.487 1164 694.576C1102.82 681.082 1031.98 680.048 973 703.45C952.411 711.62 934.33 723.447 916 735.667C900.732 745.846 884.977 756.826 866 757.907C838.471 759.475 820.983 734.226 799 722.309C765.57 704.186 725.881 695.943 688 695.015C642.001 693.888 596.807 699.529 553 714.001C542.022 717.628 530.887 721.754 521 727.811C517.806 729.768 512.622 732.219 511.256 735.985C509.352 741.236 518.103 740.985 521 740.999C533.333 741.059 545.667 740.999 558 741C589.959 741.002 623.345 747.537 653 759.4C672.243 767.097 689.8 780.92 694.764 802C698.516 817.934 693.336 833.822 686.247 848C671.704 877.086 647.933 901.679 621 919.667C611.68 925.891 592.679 941.863 608.108 953.297C622.622 964.052 640.163 948.137 651 940.154C681.292 917.842 716.486 903.742 754 900.17C778.18 897.867 803.854 901.161 826 911.309C845.943 920.446 861.649 935.078 885 934.545C895.699 934.301 906.527 931.729 916 926.677C922.691 923.109 928.402 918.012 935 914.309C949.892 905.953 965.551 899.122 982 894.427C1015.55 884.855 1051.5 884.739 1085 894.721C1106.33 901.077 1125.57 911.495 1146 920M1200 764.425C1188.97 765.926 1178.06 769.024 1169 775.761C1164.86 778.841 1161.02 782.607 1158.27 787C1155.8 790.952 1154.07 795.407 1153.29 800C1147.79 832.292 1182.94 854.487 1212 850.711C1228.93 848.511 1248.56 839.467 1255.66 823C1270.18 789.364 1230.75 760.24 1200 764.425M591 781.514C578.811 782.279 566.757 782.878 556 789.468C534.376 802.714 527.006 832.299 547.09 850.561C560.555 862.803 578.34 866.334 596 864.914C603.854 864.283 612.079 861.866 619 858.1C624.215 855.261 628.897 851.454 632.815 846.999C658.43 817.871 623.779 779.457 591 781.514M1035 1029.47C1017.11 1032.84 1003.35 1052.11 995.231 1067C975.703 1102.83 955.635 1138.58 937.248 1175C931.26 1186.86 925.168 1199.4 917.101 1210C912.723 1215.75 907.194 1221.18 900 1223.07C882.759 1227.59 869.03 1204.47 860.859 1193C833.299 1154.3 806.866 1114.79 779.424 1076C770.527 1063.42 762.03 1050.75 747 1045.07C740.252 1042.51 731.966 1041.94 726.343 1047.39C721.609 1051.98 721.282 1060.78 721.04 1067C720.258 1087.07 734.29 1107.17 742 1125C761.308 1169.66 782.309 1213.64 802.306 1258C812.949 1281.61 828.312 1307.55 827.996 1334C827.6 1367.09 787.616 1386.06 759 1388.83C748.606 1389.84 738.339 1388.02 728 1388C722.268 1387.99 717.5 1389.22 711.961 1389.87C707.982 1390.34 703.944 1389.62 700 1390.53C692.255 1392.32 684.187 1399.59 684.187 1408C684.187 1418.78 695.028 1423.41 704 1425.19C712.178 1426.82 719.852 1424.65 728 1424.09C742.479 1423.1 757.497 1423 772 1423C840.368 1423 908.704 1421 977 1421L1038 1421C1048.53 1421 1062.17 1421.93 1072 1417.63C1089.01 1410.2 1079.62 1389.4 1064 1388.09C1042.92 1386.33 1021.14 1386 1000 1386C986.957 1386 970.685 1386.28 960.09 1377.47C942.87 1363.15 950.927 1334.16 956.141 1316C961.957 1295.74 972.938 1277.06 981.691 1258C997.342 1223.92 1013.2 1189.91 1029.22 1156C1037.69 1138.06 1046.03 1120.03 1054.31 1102C1060.25 1089.07 1066.37 1077.7 1065.15 1063C1063.82 1046.86 1054.84 1025.73 1035 1029.47M1768 1442C1767.97 1488.71 1734.55 1533.02 1694 1553.25C1679.68 1560.39 1663.14 1565.96 1647 1566C1650.96 1567.66 1655.74 1567 1660 1567L1684 1567L1769 1567L1769 1480L1769 1455C1769 1450.74 1769.66 1445.96 1768 1442M0 1448L0 1567L121 1567C115.638 1564.73 108.757 1564.85 103 1563.58C93.3405 1561.45 83.8951 1558.08 75 1553.74C43.9997 1538.63 20.7955 1511.82 8.2037 1480C4.16118 1469.79 4.15295 1457.81 0 1448z"/>
                </svg>

                <span>BLUEBIRD</span>
            </router-link>
        </div>

             <!-- Username in the middle with flex -->
             <div v-if="isAuthenticated" class="username-container">
            <span class="username-display">{{ userEmail.split("@")[0] }}</span>
            </div>
  

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <!-- <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div> -->
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>


       

            <div class="layout-topbar-menu-dropdown">
                    <div class="layout-topbar-menu-content">
                        <!-- <button type="button" class="layout-topbar-action">
                            <i class="pi pi-user"></i>
                            <span>Profile</span>
                        </button>
                        <button type="button" class="layout-topbar-action">
                            <i class="pi pi-cog"></i>
                            <span>Settings</span>
                        </button> -->
                        <!-- <button type="button" class="layout-topbar-action" @click="logout">
                            <i class="pi pi-sign-out"></i>
                            <span>Logout</span>
                        </button> -->
                    </div>
                </div>
        </div>
    </div>
  
</template>


<style scoped>
  .username-container {
    display: flex;
    align-items: center; /* Vertically centers the username */
    justify-content: flex-end;
    flex-grow: 1; /* Takes available space between logo and actions */
}

.username-display {
    font-weight: 500;
    padding: 0 10px;
}

.username-display {
    font-weight: 500;
    padding: 0 10px;
}


.layout-topbar-logo-container, 
.layout-topbar-actions {
    flex-shrink: 0;}

</style>