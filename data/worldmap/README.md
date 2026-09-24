# Map Keys

| Key | Type |
| --- | --- |
| 1 | mountain |
| 2 | lake |
| 3 | building |
| 4 | castle |
| 5 | fortress / stronghold area |
| 6 | facility area |
| 7 | alliance resource node coverage |

## Files

| File | Contents |
| --- | --- |
| `mountain.json` | Mountain coordinates |
| `lake.json` | Lake coordinates |
| `building.json` | Facility and FT/SH coordinates |
| `castle.json` | Castle area coordinates |
| `ft_sh_area.json` | Fortress / stronghold area coordinates |
| `facility_area.json` | Facility area coordinates |
| `facility_typed.json` | Facility anchor coordinates with compact type and level codes |
| `alliance_resource_node.json` | Alliance resource node base coordinates |
| `alliance_resource_node_typed.json` | Alliance resource node base coordinates with resource type |
| `alliance_resource_node_coverage.json` | Alliance resource node 2x2 coverage coordinates |
| `worldmap.json` | Combined coordinates with `key` |

`facility_typed.json` contains one `{ "x", "y", "t", "l" }` record for each facility, using its existing point in `building.json` as the anchor. The website associates each anchor with the matching facility area. `t` is the facility type code and `l` is its level:

| `t` | Facility |
| ---: | --- |
| 1 | Construction |
| 2 | Defense |
| 3 | Tech |
| 4 | Weapons |
| 5 | Gathering |
| 6 | Production |
| 7 | Training |
| 8 | Expedition |

The file does not include bonus values or the stat the facility increases.
