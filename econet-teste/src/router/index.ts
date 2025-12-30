import { createRouter, createWebHistory } from 'vue-router'

const CompanyListPage = () => import('../pages/companies/CompanyListPage.vue')
const CompanyDetailsPage = () => import('../pages/companies/CompanyDetailsPage.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/companies' },
    { path: '/companies', name: 'companies', component: CompanyListPage },
    { path: '/companies/:id', name: 'company-details', component: CompanyDetailsPage, props: true },
  ],
})

export default router
