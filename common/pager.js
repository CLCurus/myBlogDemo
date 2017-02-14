'use strict';

//创建页面对象，用于分页请求时候传递页数据

function Pager(page){
    this.currentPager = page.currentPage;
    this.totalPages = page.totalPages;
    this.Url = page.Url; //用于区分searchArticle时的请求
    this.keyWord = page.keyWord; //用于搜索分页是请求对应的页面数据
}

module.exports = Pager;