#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
应用入口点
可以通过 python -m app 运行
"""

from app.database_init import init_database

if __name__ == "__main__":
    init_database() 