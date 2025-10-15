import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Breadcrumbs } from "./breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Database,
  CheckSquare,
  Folder,
  Shield,
  Key,
  ScrollText,
  Code2,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Save,
  X,
  Trash2,
  Download
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useDatabaseSchema, useParsedDatabaseNodes, useUpdateNode, useCypherMutation } from "../lib/graphql-hooks";
import { TypeManagementDialog } from "./type-management-dialog";

export function DatabaseView() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNode, setEditedNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
  const [typeManagementOpen, setTypeManagementOpen] = useState(false);

  const { data: schemaData, loading: schemaLoading } = useDatabaseSchema();

  const { data: selectedTableData, loading: selectedTableLoading, refetch } = useParsedDatabaseNodes(
    { label: selectedTable || "Memory", limit: 300 },
    { skip: !selectedTable }
  );

  const [updateNode] = useUpdateNode({
    onCompleted: (data) => {
      console.log("Node updated:", data);
      refetch();
    },
    onError: (error) => {
      console.error("Failed to update node:", error);
    },
  });

  const [executeCypher] = useCypherMutation({
    onCompleted: (data) => {
      console.log("Cypher executed:", data);
      refetch();
    },
    onError: (error) => {
      console.error("Cypher execution failed:", error);
    },
  });

  const schema = schemaData?.databaseSchema ? {
    success: schemaData.databaseSchema.success,
    tables: schemaData.databaseSchema.labels.map((label) => ({
      label: label.name,
      count: label.count,
    })),
    relationshipTypes: schemaData.databaseSchema.relationshipTypes.map((rt) => rt.name),
    totalTables: schemaData.databaseSchema.labels.length,
  } : undefined;

  // Client-side filtering, sorting and pagination
  const filteredNodes = useMemo(() => {
    let nodes = selectedTableData?.databaseNodes || [];

    // Search filter
    if (searchQuery) {
      nodes = nodes.filter((node: any) => {
        const text = node.content || node.text || node.name || node.title || "";
        return text.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Type filter
    if (filterType !== "all") {
      nodes = nodes.filter((node: any) => node.type === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      nodes = nodes.filter((node: any) => node.status === filterStatus);
    }

    // Sorting
    if (sortColumn) {
      nodes.sort((a: any, b: any) => {
        let aVal, bVal;

        switch (sortColumn) {
          case 'text':
            aVal = (a.content || a.text || a.name || a.title || '').toLowerCase();
            bVal = (b.content || b.text || b.name || b.title || '').toLowerCase();
            break;
          case 'type':
            aVal = (a.type || '').toLowerCase();
            bVal = (b.type || '').toLowerCase();
            break;
          case 'status':
            aVal = (a.status || '').toLowerCase();
            bVal = (b.status || '').toLowerCase();
            break;
          case 'updated':
            aVal = new Date(a.created_at || a.timestamp || 0).getTime();
            bVal = new Date(b.created_at || b.timestamp || 0).getTime();
            break;
          default:
            return 0;
        }

        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return nodes;
  }, [selectedTableData, searchQuery, filterType, filterStatus, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredNodes.length / pageSize);
  const paginatedNodes = filteredNodes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Row selection handlers
  const toggleRowSelection = (nodeId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(nodeId)) {
      newSelected.delete(nodeId);
    } else {
      newSelected.add(nodeId);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === paginatedNodes.length && paginatedNodes.length > 0) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(paginatedNodes.map((n: any) => n._id));
      setSelectedRows(allIds);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if table is shown and no dialog is open
      if (!selectedTable || dialogOpen || isEditing) return;

      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          setFocusedRowIndex((prev) => Math.min(prev + 1, paginatedNodes.length - 1));
          break;
        case 'k':
          e.preventDefault();
          setFocusedRowIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'enter':
          e.preventDefault();
          if (paginatedNodes[focusedRowIndex]) {
            setSelectedNode(paginatedNodes[focusedRowIndex]);
            setDialogOpen(true);
          }
          break;
        case 'x':
          e.preventDefault();
          if (paginatedNodes[focusedRowIndex]) {
            toggleRowSelection(paginatedNodes[focusedRowIndex]._id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTable, dialogOpen, isEditing, paginatedNodes, focusedRowIndex]);

  // Reset focused row when page changes
  useEffect(() => {
    setFocusedRowIndex(0);
  }, [currentPage]);

  // Extract unique types and statuses for filters
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    selectedTableData?.databaseNodes?.forEach((node: any) => {
      if (node.type) types.add(node.type);
    });
    return Array.from(types);
  }, [selectedTableData]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    selectedTableData?.databaseNodes?.forEach((node: any) => {
      if (node.status) statuses.add(node.status);
    });
    return Array.from(statuses);
  }, [selectedTableData]);

  const handleSaveNode = async (nodeId: string, properties: Record<string, any>) => {
    const propertiesJson = JSON.stringify(properties);
    await updateNode({
      variables: {
        nodeId,
        properties: propertiesJson
      }
    });
    setSelectedNode({ ...selectedNode, ...properties });
    setIsEditing(false);
    setDialogOpen(false);
  };

  const handleEditClick = () => {
    setEditedNode({ ...selectedNode });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editedNode?._id) return;

    const updatedProps = {
      text: editedNode.content || editedNode.text,
      type: editedNode.type,
      status: editedNode.status
    };

    await handleSaveNode(editedNode._id, updatedProps);
  };

  const handleCancelEdit = () => {
    setEditedNode(null);
    setIsEditing(false);
  };

  // Type management handlers
  const handleRenameType = async (oldType: string, newType: string) => {
    const cypher = `MATCH (n) WHERE n.type = $oldType SET n.type = $newType RETURN count(n) as count`;
    const parameters = { oldType, newType };

    await executeCypher({
      variables: {
        cypher,
        parameters: JSON.stringify(parameters),
      },
    });
  };

  const handleDeleteType = async (typeName: string, reassignTo?: string) => {
    let cypher: string;
    let parameters: Record<string, any>;

    if (reassignTo) {
      cypher = `MATCH (n) WHERE n.type = $typeName SET n.type = $newType RETURN count(n) as count`;
      parameters = { typeName, newType: reassignTo };
    } else {
      cypher = `MATCH (n) WHERE n.type = $typeName REMOVE n.type RETURN count(n) as count`;
      parameters = { typeName };
    }

    await executeCypher({
      variables: {
        cypher,
        parameters: JSON.stringify(parameters),
      },
    });
  };

  const handleCreateType = async (typeName: string) => {
    const cypher = `CREATE (n:Memory {type: $typeName, content: $content, status: 'active', created_at: datetime()}) RETURN elementId(n) as id`;
    const parameters = {
      typeName,
      content: `Type placeholder: ${typeName}`,
    };

    await executeCypher({
      variables: {
        cypher,
        parameters: JSON.stringify(parameters),
      },
    });
  };

  // Prepare types with count for TypeManagementDialog
  const typesWithCount = useMemo(() => {
    const typeMap = new Map<string, number>();
    selectedTableData?.databaseNodes?.forEach((node: any) => {
      if (node.type) {
        typeMap.set(node.type, (typeMap.get(node.type) || 0) + 1);
      }
    });
    return Array.from(typeMap.entries()).map(([name, count]) => ({ name, count }));
  }, [selectedTableData]);

  const getIcon = (label: string) => {
    switch (label) {
      case 'Memory': return Database;
      case 'Task': return CheckSquare;
      case 'User': return Database;
      case 'Project': return Folder;
      case 'Rule': return Shield;
      case 'Secret': return Key;
      case 'Log': return ScrollText;
      case 'MCP': return Code2;
      case 'Service': return Settings;
      case 'Route': return Code2;
      default: return Database;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tables</CardTitle>
          <CardDescription>View and manage the data stored in your memory system</CardDescription>
        </CardHeader>
        <CardContent>
          {schemaLoading ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : selectedTable ? (
            <div className="space-y-4">
              {/* Header with Breadcrumbs, Search, Filters */}
              <div className="flex items-center justify-between">
                <Breadcrumbs
                  items={[
                    {
                      label: "Database",
                      onClick: () => setSelectedTable(null)
                    },
                    {
                      label: selectedTable
                    },
                  ]}
                />
              </div>

              {/* Bulk Actions Toolbar */}
              {selectedRows.size > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <span className="text-sm">
                    {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement bulk export
                        console.log("Export selected:", Array.from(selectedRows));
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement bulk delete
                        console.log("Delete selected:", Array.from(selectedRows));
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRows(new Set())}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {uniqueStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setTypeManagementOpen(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Types
                </Button>
              </div>

              {/* Table View */}
              {selectedTableLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="rounded-md border max-h-[calc(100vh-28rem)] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={selectedRows.size === paginatedNodes.length && paginatedNodes.length > 0}
                              onCheckedChange={toggleAllRows}
                            />
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleSort('text')}
                            >
                              Text
                              {sortColumn === 'text' ? (
                                sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[150px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleSort('type')}
                            >
                              Type
                              {sortColumn === 'type' ? (
                                sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[120px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleSort('status')}
                            >
                              Status
                              {sortColumn === 'status' ? (
                                sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[150px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleSort('updated')}
                            >
                              Updated
                              {sortColumn === 'updated' ? (
                                sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedNodes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-64">
                              <div className="flex flex-col items-center justify-center gap-3 text-center">
                                <Database className="h-12 w-12 text-muted-foreground/50" />
                                <div className="space-y-1">
                                  <p className="text-muted-foreground">No records found</p>
                                  <p className="text-sm text-muted-foreground/70">
                                    {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                                      ? 'Try adjusting your filters'
                                      : 'Get started by adding your first memory'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedNodes.map((node: any, index: number) => (
                            <TableRow
                              key={node._id || index}
                              className={`cursor-pointer hover:bg-accent/50 ${
                                index === focusedRowIndex ? 'ring-2 ring-ring ring-inset' : ''
                              }`}
                              onClick={() => {
                                setSelectedNode(node);
                                setDialogOpen(true);
                              }}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedRows.has(node._id)}
                                  onCheckedChange={() => toggleRowSelection(node._id)}
                                />
                              </TableCell>
                              <TableCell className="max-w-md truncate py-3">
                                {node.content || node.text || node.name || node.title || 'No content'}
                              </TableCell>
                              <TableCell>
                                {node.type && <Badge variant="outline">{node.type}</Badge>}
                              </TableCell>
                              <TableCell>
                                {node.status && <Badge variant="secondary">{node.status}</Badge>}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDate(node.created_at || node.timestamp)}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedNode(node);
                                      setDialogOpen(true);
                                    }}>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedNode(node);
                                      setEditedNode({ ...node });
                                      setIsEditing(true);
                                      setDialogOpen(true);
                                    }}>
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      // TODO: Implement duplicate
                                      console.log("Duplicate:", node);
                                    }}>
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: Implement delete
                                        console.log("Delete:", node);
                                      }}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rows per page:</span>
                      <Select value={String(pageSize)} onValueChange={(v) => {
                        setPageSize(Number(v));
                        setCurrentPage(1);
                      }}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : schema?.tables && schema.tables.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-[600px] overflow-y-auto pr-2">
              {schema.tables.map((table) => {
                const Icon = getIcon(table.label);

                return (
                  <div
                    key={table.label}
                    className="flex flex-col gap-2 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedTable(table.label)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm">{table.label}</h4>
                      </div>
                      <Badge variant="secondary">{table.count}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      Neo4j label • {table.count} nodes
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No tables found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Modal for Detail View (Center) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedNode?.content || selectedNode?.text || selectedNode?.name || selectedNode?.title}
            </DialogTitle>
            <DialogDescription>
              Memory details and properties
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Memory Content */}
            <div>
              <Label>Memory</Label>
              {isEditing ? (
                <Textarea
                  value={editedNode?.content || editedNode?.text || ''}
                  onChange={(e) => setEditedNode({ ...editedNode, content: e.target.value, text: e.target.value })}
                  rows={4}
                  className="mt-2"
                />
              ) : (
                <div className="mt-2 p-3 rounded-md border bg-muted/30">
                  <p className="whitespace-pre-wrap break-words">
                    {selectedNode?.content || selectedNode?.text || selectedNode?.name || selectedNode?.title || 'No content'}
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                {isEditing ? (
                  <Input
                    value={editedNode?.type || ''}
                    onChange={(e) => setEditedNode({ ...editedNode, type: e.target.value })}
                    className="mt-2"
                    placeholder="e.g., preference, context"
                  />
                ) : (
                  <div className="mt-2">
                    {selectedNode?.type ? <Badge>{selectedNode.type}</Badge> : <span className="text-muted-foreground">—</span>}
                  </div>
                )}
              </div>

              <div>
                <Label>Status</Label>
                {isEditing ? (
                  <Input
                    value={editedNode?.status || ''}
                    onChange={(e) => setEditedNode({ ...editedNode, status: e.target.value })}
                    className="mt-2"
                    placeholder="e.g., active, archived"
                  />
                ) : (
                  <div className="mt-2">
                    {selectedNode?.status ? <Badge variant="secondary">{selectedNode.status}</Badge> : <span className="text-muted-foreground">—</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* ID */}
              {selectedNode?._id && (
                <div className="col-span-2">
                  <Label>ID</Label>
                  <Input
                    value={selectedNode._id}
                    disabled
                    className="mt-2 font-mono"
                  />
                </div>
              )}

              {/* Labels */}
              {selectedNode?._labels && selectedNode._labels.length > 0 && (
                <div className="col-span-2">
                  <Label>Labels</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedNode._labels.map((label: string) => (
                      <Badge key={label} variant="outline">{label}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="col-span-2">
                <Label>Created</Label>
                <p className="mt-2 text-muted-foreground">
                  {selectedNode?.created_at
                    ? new Date(selectedNode.created_at).toLocaleString()
                    : selectedNode?.timestamp
                    ? new Date(selectedNode.timestamp).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={handleEditClick}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Type Management Dialog */}
      <TypeManagementDialog
        open={typeManagementOpen}
        onOpenChange={setTypeManagementOpen}
        types={typesWithCount}
        onRenameType={handleRenameType}
        onDeleteType={handleDeleteType}
        onCreateType={handleCreateType}
      />
    </>
  );
}
