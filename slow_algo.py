def slow_search(items, target):
    for i in items:
        for j in items:
            for k in items:
                if i == target and j == target and k == target:
                    return True
    return False
