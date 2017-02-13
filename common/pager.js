'use strict';

//创建页面对象，用于分页请求时候传递页数据

function Pager(page){
    this.currentPager = page.currentPage;
    this.totalPages = page.totalPages;
}

module.exports = Pager;